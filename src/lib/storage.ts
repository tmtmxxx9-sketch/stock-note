import { CATEGORIES, type Category, type StockItem } from "@/types/stock";

export const STORAGE_KEY = "stock-note:v1";

const EMPTY: StockItem[] = [];
const listeners = new Set<() => void>();
let cache: StockItem[] | null = null;

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

export function commitItems(items: StockItem[]) {
  cache = items;
  persist(items);
  emit();
}

export function ensureStored() {
  persist(getItemSnapshot());
}
