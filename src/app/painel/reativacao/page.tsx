import Campanhas from "./Campanhas";
import Fila from "./Fila";
import { Titulo } from "@/components/ui";
import { sessaoAtual } from "@/lib/loja";
import { criarClienteServidor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export type NaFila = {
  cliente_id: string;
  nome: string;
  telefone: string;
  campanha_id: string;
  campanha_nome: string;
  tipo: string;
  dias_sem_pedir: number;
  selos: number;
  mensagem: string;
};

export type Campanha = {
  id: string;
  nome: string;
  tipo: string;
  dias_gatilho: number;
  mensagem: string;
  ativa: boolean;
};

export default async function PaginaReativacao() {
  const { loja, papel } = await sessaoAtual();
  const supabase = criarClienteServidor();

  const [fila, campanhas] = await Promise.all([
    supabase.rpc("fila_de_hoje", { p_loja: loja.id }),
    supabase
      .from("campanhas")
      .select("id, nome, tipo, dias_gatilho, mensagem, ativa")
      .eq("loja_id", loja.id)
      .order("tipo")
  ]);

  return (
    <>
      <Titulo
        texto="Chamar de volta"
        apoio="Quem sumiu, quem faz aniversário — com a mensagem já escrita"
      />

      <Fila
        itens={(fila.data as NaFila[]) || []}
        erro={fila.error?.message || null}
        cooldown={loja.cooldown_dias}
      />

      <div className="mt-8">
        <Campanhas
          lojaId={loja.id}
          cooldown={loja.cooldown_dias}
          campanhas={(campanhas.data as Campanha[]) || []}
          podeEditar={papel === "dono" || papel === "gerente"}
        />
      </div>
    </>
  );
}
