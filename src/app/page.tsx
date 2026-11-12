import { Suspense } from "react";
import { StockApp } from "@/components/StockApp";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default function Home() {
  return (
    <Suspense fallback={<StockApp accountEmail={null} />}>
      <SignedInHome />
    </Suspense>
  );
}

async function SignedInHome() {
  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  return <StockApp accountEmail={data.user?.email ?? null} />;
}
