import type { StockItem } from "@/types/stock";

export function formatShoppingList(items: Pick<StockItem, "name" | "quantity" | "unit">[]): string {
  const lines = items.map((item) => `・${item.name} (${item.quantity}${item.unit})`);
  return ["【買い出しリスト】", ...lines].join("\n");
}
