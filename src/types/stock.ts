export const CATEGORIES = ["seasoning", "food", "daily"] as const;

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
  seasoning: "調味料",
  food: "食料品",
  daily: "日用品",
};

const LEGACY_CATEGORY: Record<string, Category> = {
  seasoning: "seasoning",
  food: "food",
  daily: "daily",
  drink: "food",
  other: "food",
  調味料: "seasoning",
  食材: "food",
  食料品: "food",
  飲料: "food",
  日用品: "daily",
  その他: "food",
};

export function normalizeCategory(value: unknown): Category | null {
  if (typeof value !== "string") return null;
  return LEGACY_CATEGORY[value] ?? null;
}
