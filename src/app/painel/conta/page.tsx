import FormConta from "./FormConta";
import { Titulo } from "@/components/ui";
import { sessaoAtual } from "@/lib/loja";

export const dynamic = "force-dynamic";

export default async function Conta() {
  const { loja, papel, email } = await sessaoAtual();

  return (
    <>
      <Titulo texto="Conta" apoio="Dados da loja e da sua operação" />
      <FormConta loja={loja} podeEditar={papel === "dono" || papel === "gerente"} email={email} />
    </>
  );
}
