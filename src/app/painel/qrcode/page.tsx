import Qrs from "./Qrs";
import { Titulo } from "@/components/ui";
import { sessaoAtual } from "@/lib/loja";
import { criarClienteServidor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export type Origem = {
  id: string;
  nome: string;
  token: string;
};

export default async function PaginaQr() {
  const { loja } = await sessaoAtual();

  const { data } = await criarClienteServidor()
    .from("origens")
    .select("id, nome, token")
    .eq("loja_id", loja.id)
    .order("criada_em");

  return (
    <>
      <Titulo
        texto="QR code"
        apoio="O cliente escaneia, se cadastra em 30 segundos e o cartão dele nasce"
      />
      <Qrs
        lojaId={loja.id}
        slug={loja.slug}
        nomeLoja={loja.nome}
        selosParaPremio={loja.selos_para_premio}
        nomePremio={loja.nome_premio}
        origens={(data as Origem[]) || []}
      />
    </>
  );
}
