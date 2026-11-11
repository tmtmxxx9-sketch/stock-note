"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { CategoryBadge, ExpiryLine, SignalBadge } from "@/components/Badges";
import type { StockItem } from "@/types/stock";

type ItemCardProps = {
  item: StockItem;
  today: Date;
  onQuantity: (id: string, quantity: number) => void;
  onToggleShopping: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ItemCard({ item, today, onQuantity, onToggleShopping, onDelete }: ItemCardProps) {
  return (
    <article className="rounded-2xl border border-line bg-card p-4 shadow-sm transition active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight">{item.name}</h2>
          <ExpiryLine item={item} today={today} />
        </div>
        <SignalBadge item={item} today={today} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={item.category} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`${item.name}を減らす`}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-white text-foreground transition hover:bg-stone-50 disabled:opacity-40"
            disabled={item.quantity <= 0}
            onClick={() => onQuantity(item.id, item.quantity - 1)}
          >
            <Minus aria-hidden="true" size={18} />
          </button>
          <p className="min-w-16 text-center text-base font-semibold tabular-nums">
            {item.quantity}
            <span className="ml-1 text-sm font-medium text-muted">{item.unit}</span>
          </p>
          <button
            type="button"
            aria-label={`${item.name}を増やす`}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-white text-foreground transition hover:bg-stone-50"
            onClick={() => onQuantity(item.id, item.quantity + 1)}
          >
            <Plus aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={item.inShoppingList}
            className={`inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition ${
              item.inShoppingList
                ? "bg-emerald-700 text-white"
                : "bg-stone-100 text-stone-800"
            }`}
            onClick={() => onToggleShopping(item.id)}
          >
            <ShoppingCart aria-hidden="true" size={16} />
            {item.inShoppingList ? "リスト済み" : "買い足し"}
          </button>
          <button
            type="button"
            aria-label={`${item.name}を削除`}
            className="inline-flex size-11 items-center justify-center rounded-full text-stone-500 transition hover:bg-red-50 hover:text-red-700"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
