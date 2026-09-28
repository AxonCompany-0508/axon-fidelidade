"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Erro } from "@/components/ui";
import { criarCliente } from "@/lib/supabase/client";

function paraNumero(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const limpo = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = Number(limpo);
  return isFinite(n) && n > 0 ? n : null;
}

export default function TicketMedio({
  lojaId,
  atual,
  podeEditar
}: {
  lojaId: string;
  atual: number | null;
  podeEditar: boolean;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(atual ? String(atual).replace(".", ",") : "");
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  async function salvar() {
    setErro(null);
    setSalvo(false);

    const n = paraNumero(valor);
    if (valor.trim() && n === null) {
      setErro("Escreva um valor tipo 48,50.");
      return;
    }

    setOcupado(true);
    const { error } = await criarCliente()
      .from("lojas")
      .update({ ticket_medio: n })
      .eq("id", lojaId);
    setOcupado(false);

    if (error) {
      setErro(error.message);
      return;
    }
    setSalvo(true);
    router.refresh();
    window.setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <section className="cartao p-5">
      <h2 className="font-display text-[17px] font-bold">Seu ticket médio</h2>
      <p className="mt-1 max-w-lg text-[14px] leading-relaxed text-fumaca">
        {atual
          ? "Usado só para estimar em reais o que voltou. Muda quando quiser."
          : "Informe quanto o cliente gasta em média por pedido e a tela passa a mostrar o retorno em reais, não só em número de pessoas."}
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="rotulo">Valor médio por pedido</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-cinza">
              R$
            </span>
            <input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="48,00"
              inputMode="decimal"
              disabled={!podeEditar}
              className="campo w-[170px] pl-10"
            />
          </div>
        </label>

        {podeEditar && (
          <button type="button" onClick={salvar} disabled={ocupado} className="btn-brasa">
            {ocupado ? "Salvando..." : "Salvar"}
          </button>
        )}

        {salvo && <span className="pb-3 text-[14px] text-folha">Salvo.</span>}
      </div>

      <Erro texto={erro} />
    </section>
  );
}
