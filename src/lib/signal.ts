import type { StockItem } from "@/types/stock";

export type SignalLevel = "red" | "amber" | "green";

export type Signal = {
  level: SignalLevel;
  label: string;
};

const DAY_MS = 86_400_000;

export function daysUntil(expiryDate: string, today = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) return null;
  const [year, month, day] = expiryDate.split("-").map(Number);
  const expiry = new Date(year, month - 1, day);
  if (
    expiry.getFullYear() !== year ||
    expiry.getMonth() !== month - 1 ||
    expiry.getDate() !== day
  ) {
    return null;
  }
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((expiry.getTime() - start.getTime()) / DAY_MS);
}

export function describeItem(
  item: Pick<StockItem, "quantity" | "expiryDate">,
  today = new Date(),
): Signal {
  const days = daysUntil(item.expiryDate, today);
  if (days !== null && days < 0) return { level: "red", label: "期限切れ" };
  if (days === 0) return { level: "red", label: "本日中" };
  if (item.quantity <= 1) return { level: "red", label: "残りわずか" };
  if (days !== null && days <= 3) return { level: "amber", label: "期限が近い" };
  if (item.quantity <= 2) return { level: "amber", label: "残り少なめ" };
  return { level: "green", label: "余裕あり" };
}

export function formatExpiry(expiryDate: string): string {
  const days = daysUntil(expiryDate);
  if (days === null) return "期限なし";
  const [year, month, day] = expiryDate.split("-").map(Number);
  const date = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
  if (days < 0) return `${date} · 期限切れ`;
  if (days === 0) return `${date} · 本日`;
  return `${date} · あと${days}日`;
}
