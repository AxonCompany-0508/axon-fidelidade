import Avaliacoes from "./Avaliacoes";
import { Titulo } from "@/components/ui";
import { sessaoAtual } from "@/lib/loja";
import { criarClienteServidor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export type NaFilaAvaliacao = {
  cliente_id: string;
  nome: string;
  telefone: string;
  total_pedidos: number;
  mensagem: string;
};

export default async function PaginaAvaliacoes() {
  const { loja, papel } = await sessaoAtual();

  const { data, error } = await criarClienteServidor().rpc("fila_avaliacao", {
    p_loja: loja.id
  });

  return (
    <>
      <Titulo
        texto="Avaliações no Google"
        apoio="Quem já é cliente de casa é quem escreve avaliação boa"
      />
      <Avaliacoes
        loja={loja}
        itens={(data as NaFilaAvaliacao[]) || []}
        erro={error?.message || null}
        podeEditar={papel === "dono" || papel === "gerente"}
      />
    </>
  );
}
