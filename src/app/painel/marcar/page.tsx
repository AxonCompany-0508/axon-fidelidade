import Balcao from "./Balcao";
import { Titulo } from "@/components/ui";
import { sessaoAtual } from "@/lib/loja";

export const dynamic = "force-dynamic";

export default async function PaginaMarcar() {
  const { loja } = await sessaoAtual();

  return (
    <>
      <Titulo texto="Marcar pedido" apoio="Busque pelo telefone e dê o selo" />
      <Balcao
        lojaId={loja.id}
        meta={loja.selos_para_premio}
        premio={loja.nome_premio}
      />
    </>
  );
}
