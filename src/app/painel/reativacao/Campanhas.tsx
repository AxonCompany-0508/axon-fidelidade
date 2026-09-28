"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Aviso, Erro } from "@/components/ui";
import { criarCliente } from "@/lib/supabase/client";
import type { Campanha } from "./page";

const VARIAVEIS = [
  { chave: "{nome}", vira: "o primeiro nome do cliente" },
  { chave: "{dias}", vira: "quantos dias sem pedir" },
  { chave: "{loja}", vira: "o nome da sua loja" },
  { chave: "{premio}", vira: "o prêmio do cartão" },
  { chave: "{faltam}", vira: "quantos selos faltam pra ele" }
];

function Uma({
  c,
  podeEditar,
  aoSalvar
}: {
  c: Campanha;
  podeEditar: boolean;
  aoSalvar: () => void;
}) {
  const [mensagem, setMensagem] = useState(c.mensagem);
  const [dias, setDias] = useState(String(c.dias_gatilho));
  const [ativa, setAtiva] = useState(c.ativa);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const ehInativo = c.tipo === "inativo";

  async function salvar() {
    setErro(null);
    setSalvo(false);

    if (!mensagem.trim()) {
      setErro("A mensagem não pode ficar vazia.");
      return;
    }

    setOcupado(true);
    const { error } = await criarCliente()
      .from("campanhas")
      .update({
        mensagem: mensagem.trim(),
        dias_gatilho: ehInativo ? Math.max(Number(dias) || 1, 1) : 0,
        ativa
      })
      .eq("id", c.id);
    setOcupado(false);

    if (error) {
      setErro(error.message);
      return;
    }
    setSalvo(true);
    aoSalvar();
    window.setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <section className="cartao p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[17px] font-bold">{c.nome}</h3>
          <p className="mt-0.5 text-[13.5px] text-fumaca">
            {ehInativo
              ? "Entra na fila quem passou do prazo sem pedir"
              : "Entra na fila quem faz aniversário no mês corrente"}
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={ativa}
            onChange={(e) => setAtiva(e.target.checked)}
            disabled={!podeEditar}
            style={{ width: 18, height: 18 }}
            className="accent-[#FF7A18]"
          />
          <span className="text-[14px] text-fumaca">{ativa ? "Ligada" : "Desligada"}</span>
        </label>
      </div>

      {ehInativo && (
        <label className="mt-4 block max-w-[220px]">
          <span className="rotulo">Depois de quantos dias sem pedir</span>
          <input
            value={dias}
            onChange={(e) => setDias(e.target.value.replace(/\D/g, "").slice(0, 3))}
            inputMode="numeric"
            disabled={!podeEditar}
            className="campo"
          />
        </label>
      )}

      <label className="mt-4 block">
        <span className="rotulo">Mensagem</span>
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={4}
          disabled={!podeEditar}
          className="campo resize-y leading-relaxed"
        />
      </label>

      <Erro texto={erro} />

      {podeEditar && (
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={salvar} disabled={ocupado} className="btn-brasa !py-2.5">
            {ocupado ? "Salvando..." : "Salvar"}
          </button>
          {salvo && <span className="text-[14px] text-folha">Salvo.</span>}
        </div>
      )}
    </section>
  );
}

export default function Campanhas({
  lojaId,
  cooldown,
  campanhas,
  podeEditar
}: {
  lojaId: string;
  cooldown: number;
  campanhas: Campanha[];
  podeEditar: boolean;
}) {
  const router = useRouter();
  const [dias, setDias] = useState(String(cooldown));
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  async function salvarCooldown() {
    setErro(null);
    setSalvo(false);
    const n = Math.max(Number(dias) || 1, 1);

    const { error } = await criarCliente()
      .from("lojas")
      .update({ cooldown_dias: n })
      .eq("id", lojaId);

    if (error) {
      setErro(error.message);
      return;
    }
    setSalvo(true);
    router.refresh();
    window.setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-[19px] font-bold">Mensagens e regras</h2>

      {campanhas.map((c) => (
        <Uma key={c.id} c={c} podeEditar={podeEditar} aoSalvar={() => router.refresh()} />
      ))}

      <section className="cartao p-5">
        <h3 className="font-display text-[17px] font-bold">Descanso entre mensagens</h3>
        <p className="mt-1 text-[14px] leading-relaxed text-fumaca">
          Ninguém recebe mais de uma mensagem dentro desse prazo, não importa quantas
          campanhas estejam ligadas.
        </p>

        <label className="mt-4 block max-w-[220px]">
          <span className="rotulo">Dias de descanso</span>
          <input
            value={dias}
            onChange={(e) => setDias(e.target.value.replace(/\D/g, "").slice(0, 3))}
            inputMode="numeric"
            disabled={!podeEditar}
            className="campo"
          />
        </label>

        <Erro texto={erro} />

        {podeEditar && (
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={salvarCooldown}
              className="btn-brasa !py-2.5"
            >
              Salvar
            </button>
            {salvo && <span className="text-[14px] text-folha">Salvo.</span>}
          </div>
        )}

        <p className="mt-4 border-t border-borda pt-4 text-[13px] leading-relaxed text-cinza">
          Abaixo de 20 dias começa a incomodar. Foi essa trava que faltou em toda base de
          WhatsApp que virou spam.
        </p>
      </section>

      <section className="cartao p-5">
        <h3 className="font-display text-[17px] font-bold">Palavras que o sistema troca</h3>
        <p className="mt-1 text-[14px] text-fumaca">
          Escreva na mensagem e o sistema substitui na hora do envio.
        </p>
        <dl className="mt-4 divide-y divide-borda">
          {VARIAVEIS.map((v) => (
            <div key={v.chave} className="flex items-baseline gap-3 py-2.5">
              <dt className="w-[86px] shrink-0 font-mono text-[13px] text-brasa">{v.chave}</dt>
              <dd className="text-[14px] text-fumaca">{v.vira}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Aviso>
        Só entra na fila quem marcou a caixinha autorizando receber mensagem. Quem não
        marcou acumula selos normalmente, mas nunca é chamado. Isso não é opcional: é o que
        te protege quando a base passar de mil pessoas.
      </Aviso>
    </div>
  );
}
