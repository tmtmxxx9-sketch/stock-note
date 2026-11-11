"use client";

import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { formatShoppingList } from "@/lib/shoppingList";
import type { StockItem } from "@/types/stock";

type ShareListButtonProps = {
  items: StockItem[];
};

export function ShareListButton({ items }: ShareListButtonProps) {
  const [copied, setCopied] = useState(false);
  const empty = items.length === 0;

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function onShare() {
    if (empty) return;
    const text = formatShoppingList(items);
    if (typeof navigator.share === "function") {
      try {
        const data = { title: "買い出しリスト", text };
        if (typeof navigator.canShare !== "function" || navigator.canShare(data)) {
          await navigator.share(data);
          return;
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      disabled={empty}
      aria-live="polite"
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
        copied
          ? "bg-emerald-700 text-white"
          : "bg-white text-emerald-800 ring-1 ring-emerald-700/15 hover:bg-emerald-50"
      }`}
      onClick={() => void onShare()}
    >
      {copied ? <Check aria-hidden="true" size={18} /> : <Share2 aria-hidden="true" size={18} />}
      {copied ? "コピー完了！" : "リストをコピーして共有"}
    </button>
  );
}
