import type { ReactNode } from "react";
import Estrutura from "@/components/Estrutura";
import { sessaoAtual } from "@/lib/loja";

export const dynamic = "force-dynamic";

export default async function LayoutPainel({ children }: { children: ReactNode }) {
  const { loja, nomeUsuario } = await sessaoAtual();

  return (
    <Estrutura nomeLoja={loja.nome} nomeUsuario={nomeUsuario}>
      {children}
    </Estrutura>
  );
}
