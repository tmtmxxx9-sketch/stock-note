"use client";

import { useActionState } from "react";
import { authenticate, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { message: "", detail: "", signedIn: false };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(authenticate, initialState);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <p className="text-sm font-semibold tracking-wide text-emerald-800">家庭の在庫</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">ログイン</h1>
      <p className="mt-2 text-sm leading-6 text-muted">世帯の在庫を開くにはログインしてください。</p>
      <form action={formAction} className="mt-6 grid gap-4 rounded-2xl border border-line bg-card p-5 shadow-sm">
        <label className="grid gap-2 text-sm font-semibold" htmlFor="email">
          メールアドレス
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11 rounded-xl border border-line bg-white px-3 text-base font-normal outline-none focus:border-emerald-700"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold" htmlFor="password">
          パスワード
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-11 rounded-xl border border-line bg-white px-3 text-base font-normal outline-none focus:border-emerald-700"
          />
        </label>
        {state.message ? (
          <div role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            <p>{state.message}</p>
            {state.detail ? <p className="mt-1 break-words font-mono text-xs">{state.detail}</p> : null}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-700 px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "ログイン中…" : "ログイン"}
        </button>
      </form>
    </main>
  );
}
