import { daysUntil } from "@/lib/signal";
import type { Category, StockItem } from "@/types/stock";

export const EXPIRY_FILTERS = ["expired", "soon", "ok"] as const;

export type ExpiryFilter = (typeof EXPIRY_FILTERS)[number];

const SOON_DAYS = 3;

export function expiryBucket(expiryDate: string, today: Date): ExpiryFilter {
  const days = daysUntil(expiryDate, today);
  if (days !== null && days <= 0) return "expired";
  if (days !== null && days <= SOON_DAYS) return "soon";
  return "ok";
}

export function matchesInventoryFilters(
  item: Pick<StockItem, "category" | "expiryDate">,
  today: Date,
  expiry: readonly ExpiryFilter[],
  categories: readonly Category[],
): boolean {
  if (expiry.length > 0 && !expiry.includes(expiryBucket(item.expiryDate, today))) return false;
  if (categories.length > 0 && !categories.includes(item.category)) return false;
  return true;
}
