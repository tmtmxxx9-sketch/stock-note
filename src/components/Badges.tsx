"use client";

import { Apple, Coffee, Flame, Package, Sparkles, type LucideIcon } from "lucide-react";
import { describeItem, formatExpiry, type SignalLevel } from "@/lib/signal";
import { CATEGORY_LABEL, type Category, type StockItem } from "@/types/stock";

const CATEGORY_STYLE: Record<Category, { icon: LucideIcon; className: string }> = {
  food: { icon: Apple, className: "bg-emerald-50 text-emerald-800" },
  daily: { icon: Package, className: "bg-sky-50 text-sky-800" },
  seasoning: { icon: Flame, className: "bg-orange-50 text-orange-800" },
  drink: { icon: Coffee, className: "bg-purple-50 text-purple-800" },
  other: { icon: Sparkles, className: "bg-stone-100 text-stone-700" },
};

const SIGNAL_STYLE: Record<SignalLevel, { badge: string; dot: string }> = {
  red: { badge: "bg-red-50 text-red-700", dot: "bg-red-500" },
  amber: { badge: "bg-amber-50 text-amber-800", dot: "bg-amber-400" },
  green: { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

export function CategoryBadge({ category }: { category: Category }) {
  const style = CATEGORY_STYLE[category];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ${style.className}`}
    >
      <Icon aria-hidden="true" size={15} strokeWidth={2.25} />
      {CATEGORY_LABEL[category]}
    </span>
  );
}

export function SignalBadge({ item, today }: { item: StockItem; today: Date }) {
  const signal = describeItem(item, today);
  const style = SIGNAL_STYLE[signal.level];
  return (
    <span
      className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ${style.badge}`}
    >
      <span aria-hidden="true" className={`size-2.5 rounded-full ${style.dot}`} />
      {signal.label}
    </span>
  );
}

export function ExpiryLine({ item, today }: { item: StockItem; today: Date }) {
  return <p className="text-sm text-muted">{formatExpiry(item.expiryDate, today)}</p>;
}
