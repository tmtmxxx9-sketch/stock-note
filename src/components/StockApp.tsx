"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AddForm } from "@/components/AddForm";
import { ItemCard } from "@/components/ItemCard";
import { ShareListButton } from "@/components/ShareListButton";
import { ViewNav } from "@/components/ViewNav";
import { describeItem } from "@/lib/signal";
import {
  commitItems,
  getItemSnapshot,
  getServerItemSnapshot,
  startSync,
  subscribeItems,
} from "@/lib/storage";
import type { StockItem, ViewId } from "@/types/stock";

const RANK = { red: 0, amber: 1, green: 2 };

function subscribeToday() {
  return () => {};
}

let cachedToday: Date | null = null;

function todayOnClient() {
  if (!cachedToday) cachedToday = new Date();
  return cachedToday;
}

function todayOnServer() {
  return null;
}

function byUrgency(left: StockItem, right: StockItem, today: Date) {
  const gap = RANK[describeItem(left, today).level] - RANK[describeItem(right, today).level];
  if (gap !== 0) return gap;
  return left.name.localeCompare(right.name, "ja");
}

export function StockApp() {
  const items = useSyncExternalStore(subscribeItems, getItemSnapshot, getServerItemSnapshot);
  const today = useSyncExternalStore(subscribeToday, todayOnClient, todayOnServer);
  const [view, setView] = useState<ViewId>("inventory");

  useEffect(() => startSync(), []);

  function update(id: string, recipe: (item: StockItem) => StockItem) {
    commitItems(
      getItemSnapshot().map((item) =>
        item.id === id ? recipe({ ...item, updatedAt: new Date().toISOString() }) : item,
      ),
    );
  }

  const shoppingItems = items.filter((item) => item.inShoppingList);
  const visible = today
    ? (view === "shopping" ? shoppingItems : items)
        .slice()
        .sort((left, right) => byUrgency(left, right, today))
    : [];
  const shoppingCount = today ? shoppingItems.length : 0;
  const attention = today
    ? items.filter((item) => describeItem(item, today).level !== "green").length
    : 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-6 pb-28 sm:px-6 sm:pt-10 sm:pb-12">
      <header>
        <p className="text-sm font-semibold tracking-wide text-emerald-800">家庭の在庫</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">ストックノート</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {today
            ? attention > 0
              ? `先に見るものが ${attention} 件あります。赤と黄から使ってください。`
              : "期限も残量も、いまは余裕があります。"
            : "在庫を読み込んでいます。"}
        </p>
      </header>
      <div className="mt-5">
        <ViewNav view={view} shoppingCount={shoppingCount} onChange={setView} placement="top" />
      </div>
      <main className="mt-5 grid gap-3">
        {view === "shopping" && today ? <ShareListButton items={visible} /> : null}
        {view === "add" ? (
          <AddForm
            onAdd={(item) => {
              commitItems([item, ...getItemSnapshot()]);
              setView("inventory");
            }}
          />
        ) : !today ? (
          <div className="h-36 rounded-2xl bg-white shadow-sm" />
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-4 py-10 text-center shadow-sm">
            <p className="font-semibold">
              {view === "shopping" ? "買い足しリストは空です" : "在庫はまだありません"}
            </p>
            <button
              type="button"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-700 px-4 text-sm font-semibold text-white"
              onClick={() => setView(view === "shopping" ? "inventory" : "add")}
            >
              {view === "shopping" ? "在庫一覧へ" : "アイテムを追加"}
            </button>
          </div>
        ) : (
          visible.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              today={today}
              onQuantity={(id, quantity) =>
                update(id, (current) => ({ ...current, quantity: Math.max(0, quantity) }))
              }
              onToggleShopping={(id) =>
                update(id, (current) => ({
                  ...current,
                  inShoppingList: !current.inShoppingList,
                }))
              }
              onDelete={(id) =>
                commitItems(getItemSnapshot().filter((current) => current.id !== id))
              }
            />
          ))
        )}
      </main>
      <ViewNav view={view} shoppingCount={shoppingCount} onChange={setView} placement="bottom" />
    </div>
  );
}
