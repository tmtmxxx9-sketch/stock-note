export const CATEGORIES = ["food", "daily", "seasoning", "drink", "other"] as const;

export type Category = (typeof CATEGORIES)[number];

export type StockItem = {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  expiryDate: string;
  inShoppingList: boolean;
  updatedAt: string;
};

export type ViewId = "inventory" | "shopping" | "add";

export const CATEGORY_LABEL: Record<Category, string> = {
  food: "食材",
  daily: "日用品",
  seasoning: "調味料",
  drink: "飲料",
  other: "その他",
};

export const UNITS = ["個", "本", "パック", "ロール", "袋"] as const;
