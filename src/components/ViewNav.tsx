"use client";

import { List, Plus, ShoppingCart } from "lucide-react";
import type { ViewId } from "@/types/stock";

const TABS: { id: ViewId; label: string; icon: typeof List }[] = [
  { id: "inventory", label: "在庫一覧", icon: List },
  { id: "shopping", label: "買い足しリスト", icon: ShoppingCart },
  { id: "add", label: "アイテム追加", icon: Plus },
];

type ViewNavProps = {
  view: ViewId;
  shoppingCount: number;
  onChange: (view: ViewId) => void;
  placement: "top" | "bottom";
};

export function ViewNav({ view, shoppingCount, onChange, placement }: ViewNavProps) {
  const bottom = placement === "bottom";
  return (
    <nav
      aria-label={bottom ? "画面の切り替え" : "画面"}
      className={
        bottom
          ? "fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur sm:hidden"
          : "hidden sm:block"
      }
    >
      <div
        className={
          bottom
            ? "mx-auto grid max-w-lg grid-cols-3 pb-[env(safe-area-inset-bottom)]"
            : "grid grid-cols-3 gap-2"
        }
        role="tablist"
      >
        {TABS.map((tab) => {
          const selected = view === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={
                bottom
                  ? `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                      selected ? "text-emerald-800" : "text-stone-500"
                    }`
                  : `inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-semibold transition ${
                      selected
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-white text-stone-700 shadow-sm"
                    }`
              }
              onClick={() => onChange(tab.id)}
            >
              <Icon aria-hidden="true" size={bottom ? 18 : 16} />
              <span className="inline-flex items-center gap-1">
                {tab.label}
                {tab.id === "shopping" && shoppingCount > 0 ? (
                  <span
                    className={`rounded-full px-1.5 text-[11px] ${
                      bottom || !selected ? "bg-emerald-100 text-emerald-800" : "bg-white/20 text-white"
                    }`}
                  >
                    {shoppingCount}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
