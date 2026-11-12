import type { StockItem } from "@/types/stock";

export function formatShoppingList(items: Pick<StockItem, "name" | "quantity">[]): string {
  const lines = items.map((item) => `・${item.name} (${item.quantity})`);
  return ["【買い出しリスト】", ...lines].join("\n");
}
