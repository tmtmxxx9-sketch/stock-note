"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type LoginState = {
  message: string;
  detail: string;
  signedIn: boolean;
};

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function authenticate(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!(formData instanceof FormData)) {
    const detail = "フォームデータが届いていません。";
    console.error("signInWithPassword skipped", detail);
    return {
      message: "入力を読み取れませんでした。もう一度お試しください。",
      detail,
      signedIn: false,
    };
  }

  const email = readField(formData, "email");
  const password = readField(formData, "password");
  if (!email || !password) {
    const detail = `email=${email ? "あり" : "空"} password=${password ? "あり" : "空"}`;
    console.error("signInWithPassword skipped", detail);
    return {
      message: "メールアドレスとパスワードを入力してください。",
      detail,
      signedIn: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const detail = "NEXT_PUBLIC_SUPABASE_URL または NEXT_PUBLIC_SUPABASE_ANON_KEY がありません。";
    console.error("signInWithPassword skipped", detail);
    return {
      message: "ログインの設定を読み取れませんでした。",
      detail,
      signedIn: false,
    };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("signInWithPassword failed", error.message);
    return {
      message: "ログインできませんでした。メールアドレスとパスワードを確認してください。",
      detail: error.message,
      signedIn: false,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
