import FormCartao from "./FormCartao";
import { Titulo } from "@/components/ui";
import { sessaoAtual } from "@/lib/loja";

export const dynamic = "force-dynamic";

export default async function PaginaCartao() {
  const { loja, papel } = await sessaoAtual();

  return (
    <>
      <Titulo
        texto="Cartão fidelidade"
        apoio="A regra que o cliente vê no cartão e no cartaz do balcão"
      />
      <FormCartao loja={loja} podeEditar={papel === "dono" || papel === "gerente"} />
    </>
  );
}
