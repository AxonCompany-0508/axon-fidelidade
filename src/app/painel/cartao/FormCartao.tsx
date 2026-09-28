"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Aviso, Botao, Campo, Erro } from "@/components/ui";
import type { Loja } from "@/lib/tipos";
import { criarCliente } from "@/lib/supabase/client";

export default function FormCartao({
  loja,
  podeEditar
}: {
  loja: Loja;
  podeEditar: boolean;
}) {
  const router = useRouter();
  const [meta, setMeta] = useState(String(loja.selos_para_premio));
  const [premio, setPremio] = useState(loja.nome_premio);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const n = Math.min(Math.max(Number(meta) || 0, 1), 30);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvo(false);

    if (!premio.trim()) {
      setErro("Escreva o que o cliente ganha.");
      return;
    }

    setCarregando(true);
    const { error } = await criarCliente()
      .from("lojas")
      .update({ selos_para_premio: n, nome_premio: premio.trim() })
      .eq("id", loja.id);
    setCarregando(false);

    if (error) {
      setErro(error.message);
      return;
    }
    setSalvo(true);
    router.refresh();
    window.setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <form onSubmit={salvar} className="space-y-5">
      <section className="cartao space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-[130px_1fr]">
          <Campo
            rotulo="Quantos pedidos"
            valor={meta}
            ao={setMeta}
            modo="numeric"
            dica="10"
          />
          <Campo
            rotulo="O cliente ganha"
            valor={premio}
            ao={setPremio}
            dica="um hambúrguer grátis"
          />
        </div>

        <Aviso>
          No cartão do cliente e no cartaz vai aparecer:{" "}
          <strong className="text-creme">
            &quot;A cada {n} pedidos, {premio.trim() || "..."}&quot;
          </strong>
        </Aviso>
      </section>

      {/* Como o cliente vê */}
      <section className="cartao p-5">
        <h2 className="font-display text-[17px] font-bold">Como o cliente vai ver</h2>
        <div className="mt-4 rounded-2xl border border-borda bg-grelha p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[12px] font-medium uppercase tracking-wide text-cinza">
              Seus selos
            </p>
            <p className="font-display text-[14px] font-bold">0 de {n}</p>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: n }).map((_, i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-full border-2 border-dashed border-borda text-[11px] font-semibold text-cinza"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-cinza">
          Entre 8 e 12 costuma funcionar melhor. Abaixo de 6 o prêmio sai caro demais;
          acima de 15 o cliente desiste antes de chegar lá.
        </p>
      </section>

      <Erro texto={erro} />

      {podeEditar ? (
        <div className="flex items-center gap-3">
          <Botao tipo="submit" carregando={carregando}>
            Salvar regra
          </Botao>
          {salvo && <span className="text-[14px] text-folha">Salvo.</span>}
        </div>
      ) : (
        <Aviso>Só o dono ou o gerente pode mudar a regra do cartão.</Aviso>
      )}
    </form>
  );
}
