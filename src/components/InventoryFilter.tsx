"use client";

import { CATEGORY_LABEL, CATEGORIES, type Category } from "@/types/stock";
import { EXPIRY_FILTERS, type ExpiryFilter } from "@/lib/filters";

const EXPIRY_LABEL: Record<ExpiryFilter, string> = {
  expired: "期限切れ",
  soon: "期限が近い",
  ok: "余裕あり",
};

const EXPIRY_TONE: Record<ExpiryFilter, string> = {
  expired: "accent-red-600",
  soon: "accent-amber-500",
  ok: "accent-emerald-600",
};

type InventoryFilterProps = {
  expiry: readonly ExpiryFilter[];
  categories: readonly Category[];
  onExpiry: (value: ExpiryFilter) => void;
  onCategory: (value: Category) => void;
};

export function InventoryFilter({ expiry, categories, onExpiry, onCategory }: InventoryFilterProps) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
      <fieldset>
        <legend className="text-sm font-semibold">期限</legend>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {EXPIRY_FILTERS.map((value) => (
            <label key={value} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={expiry.includes(value)}
                onChange={() => onExpiry(value)}
                className={`size-5 ${EXPIRY_TONE[value]}`}
              />
              {EXPIRY_LABEL[value]}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-3">
        <legend className="text-sm font-semibold">カテゴリー</legend>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {CATEGORIES.map((value) => (
            <label key={value} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={categories.includes(value)}
                onChange={() => onCategory(value)}
                className="size-5 accent-stone-700"
              />
              {CATEGORY_LABEL[value]}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
