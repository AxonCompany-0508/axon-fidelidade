import { redirect } from "next/navigation";
import FormNovaLoja from "./FormNovaLoja";
import { criarClienteServidor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NovaLoja() {
  const supabase = criarClienteServidor();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar");

  // Quem já tem loja não passa por aqui de novo.
  const { data: membro } = await supabase
    .from("membros")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membro) redirect("/painel");

  return <FormNovaLoja />;
}
