import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, type Category, type StockItem } from "@/types/stock";

export const STORAGE_KEY = "stock-note:v1";

const EMPTY: StockItem[] = [];
const listeners = new Set<() => void>();
let cache: StockItem[] | null = null;
let epoch = 0;
let dirty = false;
let pendingPushes = 0;
let pushQueue = Promise.resolve();
let subscribers = 0;
let releaseTimer: number | null = null;

type StockRow = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  in_shopping_list: boolean | null;
  updated_at: string;
};

function isoFromToday(offset: number, today: Date): string {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function createPresets(today = new Date()): StockItem[] {
  const updatedAt = today.toISOString();
  return [
    {
      id: "preset-milk",
      name: "牛乳",
      category: "drink",
      quantity: 1,
      unit: "本",
      expiryDate: isoFromToday(0, today),
      inShoppingList: true,
      updatedAt,
    },
    {
      id: "preset-egg",
      name: "卵",
      category: "food",
      quantity: 2,
      unit: "パック",
      expiryDate: isoFromToday(2, today),
      inShoppingList: false,
      updatedAt,
    },
    {
      id: "preset-paper",
      name: "トイレットペーパー",
      category: "daily",
      quantity: 6,
      unit: "ロール",
      expiryDate: "",
      inShoppingList: false,
      updatedAt,
    },
    {
      id: "preset-soy",
      name: "醤油",
      category: "seasoning",
      quantity: 1,
      unit: "本",
      expiryDate: isoFromToday(40, today),
      inShoppingList: false,
      updatedAt,
    },
  ];
}

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORIES.some((category) => category === value);
}

function isItem(value: unknown): value is StockItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<StockItem>;
  return (
    typeof item.id === "string" &&
    item.id.length > 0 &&
    typeof item.name === "string" &&
    isCategory(item.category) &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    item.quantity >= 0 &&
    typeof item.unit === "string" &&
    typeof item.expiryDate === "string" &&
    typeof item.inShoppingList === "boolean" &&
    typeof item.updatedAt === "string"
  );
}

function readStored(): StockItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return createPresets();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createPresets();
    return parsed.filter(isItem);
  } catch {
    return createPresets();
  }
}

function itemSignature(item: StockItem): string {
  return [
    item.id,
    item.name,
    item.category,
    item.quantity,
    item.unit,
    item.expiryDate,
    item.inShoppingList,
    item.updatedAt,
  ].join("\u0000");
}

function listSignature(items: StockItem[]): string {
  return items.map(itemSignature).sort().join("\n");
}

function toRow(item: StockItem): StockRow {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    expiry_date: item.expiryDate || null,
    in_shopping_list: item.inShoppingList,
    updated_at: item.updatedAt,
  };
}

function toItem(row: Partial<StockRow>): StockItem | null {
  if (typeof row.id !== "string" || typeof row.updated_at !== "string") return null;
  const item: StockItem = {
    id: row.id,
    name: typeof row.name === "string" ? row.name : "",
    category: row.category as Category,
    quantity: typeof row.quantity === "number" ? row.quantity : Number(row.quantity),
    unit: row.unit || "個",
    expiryDate: row.expiry_date ?? "",
    inShoppingList: Boolean(row.in_shopping_list),
    updatedAt: row.updated_at,
  };
  return isItem(item) ? item : null;
}

function emit() {
  for (const listener of listeners) listener();
}

function persist(items: StockItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode or a full quota keeps the in-memory list usable.
  }
}

export function subscribeItems(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getItemSnapshot(): StockItem[] {
  if (!cache) cache = readStored();
  return cache;
}

export function getServerItemSnapshot(): StockItem[] {
  return EMPTY;
}

function replaceFromRemote(items: StockItem[]) {
  if (cache && listSignature(cache) === listSignature(items)) return;
  cache = items;
  persist(items);
  emit();
}

async function pushChanges(previous: StockItem[], next: StockItem[]): Promise<boolean> {
  if (!supabase) return true;
  const nextIds = new Set(next.map((item) => item.id));
  const removedIds = previous.filter((item) => !nextIds.has(item.id)).map((item) => item.id);
  const previousById = new Map(previous.map((item) => [item.id, item]));
  const changed = next.filter((item) => {
    const before = previousById.get(item.id);
    return !before || itemSignature(before) !== itemSignature(item);
  });
  try {
    if (removedIds.length > 0) {
      const { error } = await supabase.from("stock_items").delete().in("id", removedIds);
      if (error) return false;
    }
    if (changed.length > 0) {
      const { error } = await supabase.from("stock_items").upsert(changed.map(toRow));
      if (error) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function enqueuePush(previous: StockItem[], next: StockItem[]) {
  if (!supabase) return;
  pendingPushes += 1;
  dirty = true;
  pushQueue = pushQueue
    .then(async () => {
      const ok = await pushChanges(previous, next);
      pendingPushes -= 1;
      dirty = ok ? pendingPushes > 0 : true;
    })
    .catch(() => {
      pendingPushes -= 1;
      dirty = true;
    });
}

function applyRemote(payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) {
  const current = getItemSnapshot();
  if (payload.eventType === "DELETE") {
    const id = payload.old.id;
    if (typeof id !== "string") return;
    replaceFromRemote(current.filter((item) => item.id !== id));
    return;
  }
  const item = toItem(payload.new);
  if (!item) return;
  const index = current.findIndex((entry) => entry.id === item.id);
  if (index !== -1 && Date.parse(current[index].updatedAt) > Date.parse(item.updatedAt)) return;
  const next = current.slice();
  if (index === -1) next.unshift(item);
  else next[index] = item;
  replaceFromRemote(next);
}

async function loadRemote(epochAtStart: number) {
  if (!supabase || epochAtStart !== epoch) return;
  const { data, error } = await supabase.from("stock_items").select("*");
  if (error || epochAtStart !== epoch) return;
  const remote = (data ?? [])
    .map((row) => toItem(row as Partial<StockRow>))
    .filter((item): item is StockItem => item !== null);
  if (remote.length === 0) {
    if (getItemSnapshot().length > 0) enqueuePush([], getItemSnapshot());
    return;
  }
  if (dirty || pendingPushes > 0 || epochAtStart !== epoch) return;
  replaceFromRemote(remote);
}

function ensureStored() {
  persist(getItemSnapshot());
}

export function commitItems(items: StockItem[]) {
  const previous = getItemSnapshot();
  cache = items;
  persist(items);
  emit();
  enqueuePush(previous, items);
}

function ensureChannel() {
  if (!supabase || supabase.getChannels().some((channel) => channel.topic === "realtime:stock_items_changes")) {
    return;
  }
  supabase
    .channel("stock_items_changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "stock_items" },
      (payload) => applyRemote(payload),
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "stock_items" },
      (payload) => applyRemote(payload),
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "stock_items" },
      (payload) => applyRemote(payload),
    )
    .subscribe();
}

export function startSync(): () => void {
  ensureStored();
  if (typeof window === "undefined") return () => {};
  const epochAtStart = ++epoch;
  subscribers += 1;
  if (releaseTimer !== null) {
    window.clearTimeout(releaseTimer);
    releaseTimer = null;
  }
  ensureChannel();
  void loadRemote(epochAtStart);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || epochAtStart !== epoch || event.newValue === null) return;
    try {
      const parsed: unknown = JSON.parse(event.newValue);
      if (!Array.isArray(parsed)) return;
      replaceFromRemote(parsed.filter(isItem));
    } catch {
      return;
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    epoch += 1;
    subscribers -= 1;
    window.removeEventListener("storage", onStorage);
    if (subscribers > 0 || !supabase) return;
    releaseTimer = window.setTimeout(() => {
      releaseTimer = null;
      if (subscribers > 0 || !supabase) return;
      const channel = supabase
        .getChannels()
        .find((entry) => entry.topic === "realtime:stock_items_changes");
      if (channel) void supabase.removeChannel(channel);
    }, 0);
  };
}
