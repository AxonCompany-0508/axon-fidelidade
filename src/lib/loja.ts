import { redirect } from "next/navigation";
import { criarClienteServidor } from "./supabase/server";
import type { Loja } from "./tipos";

export type { Loja };

export type Sessao = {
  userId: string;
  email: string;
  nomeUsuario: string;
  papel: string;
  loja: Loja;
};

/**
 * Descobre quem está logado e em qual loja.
 *
 * Se não estiver logado, manda para a tela de entrar.
 * Se estiver logado mas ainda não tem loja, manda para o cadastro.
 */
export async function sessaoAtual(): Promise<Sessao> {
  const supabase = criarClienteServidor();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar");

  const { data: membro } = await supabase
    .from("membros")
    .select(
      "papel, lojas ( id, nome, slug, tipo, whatsapp, plano, status, dias_risco, dias_inativo, cooldown_dias, selos_para_premio, nome_premio )"
    )
    .eq("user_id", user.id)
    .order("criado_em", { ascending: true })
    .limit(1)
    .maybeSingle();

  const bruto = membro as unknown as {
    papel: string;
    lojas: Loja | Loja[] | null;
  } | null;

  const loja = Array.isArray(bruto?.lojas) ? bruto?.lojas[0] : bruto?.lojas;

  if (!bruto || !loja) redirect("/nova-loja");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email || "",
    nomeUsuario: perfil?.nome || user.email || "",
    papel: bruto.papel,
    loja
  };
}
