"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ListFilter } from "lucide-react";
import { EXPIRY_FILTERS, type ExpiryFilter } from "@/lib/filters";
import { CATEGORY_LABEL, CATEGORIES, type Category } from "@/types/stock";

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
  onClear: () => void;
};

export function InventoryFilter({
  expiry,
  categories,
  onExpiry,
  onCategory,
  onClear,
}: InventoryFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const selected = expiry.length + categories.length;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-20">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold shadow-sm"
        onClick={() => setOpen((current) => !current)}
      >
        <ListFilter aria-hidden="true" size={18} />
        絞り込み
        {selected > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 text-xs font-semibold text-white">
            {selected}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute top-full left-0 z-30 mt-2 w-full max-w-sm rounded-2xl border border-line bg-white p-4 shadow-lg"
        >
          <fieldset>
            <legend className="text-sm font-semibold">期限</legend>
            <div className="mt-2 grid">
              {EXPIRY_FILTERS.map((value) => (
                <label
                  key={value}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
                >
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
            <div className="mt-2 grid">
              {CATEGORIES.map((value) => (
                <label
                  key={value}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
                >
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
          <button
            type="button"
            disabled={selected === 0}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-stone-100 px-4 text-sm font-semibold text-stone-800 disabled:opacity-40"
            onClick={onClear}
          >
            クリア（全解除）
          </button>
        </div>
      ) : null}
    </div>
  );
}
