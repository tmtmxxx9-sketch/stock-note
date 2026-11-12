"use client";

import { useState, type FormEvent } from "react";
import { CATEGORY_LABEL, CATEGORIES, type Category, type StockItem } from "@/types/stock";

type AddFormProps = {
  onAdd: (item: StockItem) => void;
};

export function AddForm({ onAdd }: AddFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [inShoppingList, setInShoppingList] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("名前を入力してください。");
      return;
    }
    const count = Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0;
    onAdd({
      id: crypto.randomUUID(),
      name: trimmed,
      category,
      quantity: count,
      unit: "",
      expiryDate,
      inShoppingList,
      updatedAt: new Date().toISOString(),
    });
    setName("");
    setQuantity(1);
    setExpiryDate("");
    setInShoppingList(false);
    setError("");
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5"
    >
      <h2 className="text-lg font-semibold">アイテムを追加</h2>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-1.5 text-sm font-semibold">
          名前
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例: 牛乳"
            className="min-h-11 rounded-2xl border border-line bg-white px-3 text-base font-normal outline-none focus:border-emerald-700"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          カテゴリー
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className="min-h-11 rounded-2xl border border-line bg-white px-3 text-base font-normal outline-none focus:border-emerald-700"
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABEL[value]}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold">
            在庫数
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="min-h-11 rounded-2xl border border-line bg-white px-3 text-base font-normal outline-none focus:border-emerald-700"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            賞味期限
            <input
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
              className="min-h-11 rounded-2xl border border-line bg-white px-3 text-base font-normal outline-none focus:border-emerald-700"
            />
          </label>
        </div>
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={inShoppingList}
            onChange={(event) => setInShoppingList(event.target.checked)}
            className="size-5 accent-emerald-700"
          />
          買い足しリストに入れる
        </label>
      </div>
      {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
      <button
        type="submit"
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-emerald-700 px-4 text-base font-semibold text-white transition active:scale-[0.99]"
      >
        追加する
      </button>
    </form>
  );
}
