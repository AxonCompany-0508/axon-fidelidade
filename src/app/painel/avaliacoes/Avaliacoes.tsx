"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Aviso, Erro } from "@/components/ui";
import { criarCliente } from "@/lib/supabase/client";
import { formatarTelefone } from "@/lib/telefone";
import type { Loja } from "@/lib/tipos";
import type { NaFilaAvaliacao } from "./page";

export default function Avaliacoes({
  loja,
  itens,
  erro,
  podeEditar
}: {
  loja: Loja;
  itens: NaFilaAvaliacao[];
  erro: string | null;
  podeEditar: boolean;
}) {
  const router = useRouter();

  const [link, setLink] = useState(loja.link_avaliacao || "");
  const [apos, setApos] = useState(String(loja.avaliacao_apos_pedidos));
  const [modelo, setModelo] = useState(loja.mensagem_avaliacao);
  const [erroConf, setErroConf] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const [enviados, setEnviados] = useState<Record<string, boolean>>({});
  const [falha, setFalha] = useState<string | null>(null);

  const temLink = Boolean(loja.link_avaliacao?.trim());

  async function salvar() {
    setErroConf(null);
    setSalvo(false);

    const l = link.trim();
    if (l && !/^https?:\/\//i.test(l)) {
      setErroConf("O link precisa começar com https://");
      return;
    }
    if (!modelo.includes("{link}")) {
      setErroConf("A mensagem precisa ter {link} em algum lugar, senão o cliente não recebe o endereço.");
      return;
    }

    setOcupado(true);
    const { error } = await criarCliente()
      .from("lojas")
      .update({
        link_avaliacao: l || null,
        avaliacao_apos_pedidos: Math.max(Number(apos) || 1, 1),
        mensagem_avaliacao: modelo.trim()
      })
      .eq("id", loja.id);
    setOcupado(false);

    if (error) {
      setErroConf(error.message);
      return;
    }
    setSalvo(true);
    router.refresh();
    window.setTimeout(() => setSalvo(false), 2500);
  }

  async function registrar(i: NaFilaAvaliacao) {
    setEnviados((e) => ({ ...e, [i.cliente_id]: true }));
    const { error } = await criarCliente().rpc("registrar_envio", {
      p_cliente: i.cliente_id,
      p_campanha: null,
      p_tipo: "avaliacao"
    });
    if (error) {
      setFalha("Abri o WhatsApp, mas não consegui anotar o envio. Essa pessoa pode reaparecer na fila.");
    }
  }

  const feitos = Object.keys(enviados).length;
  const faltam = itens.length - feitos;

  return (
    <div className="space-y-5">
      {/* Fila */}
      {!temLink ? (
        <section className="cartao p-6">
          <h2 className="font-display text-[18px] font-bold">
            Falta o link de avaliação da loja
          </h2>
          <p className="mt-2 max-w-lg text-[14.5px] leading-relaxed text-fumaca">
            Cole ele aí embaixo e a fila aparece. Sem o link não tem o que mandar.
          </p>
        </section>
      ) : erro ? (
        <Erro texto={erro} />
      ) : itens.length === 0 ? (
        <section className="cartao p-6 text-center">
          <p className="font-display text-[17px] font-bold">Ninguém na fila ainda</p>
          <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-fumaca">
            Entra quem já fez {loja.avaliacao_apos_pedidos}{" "}
            {loja.avaliacao_apos_pedidos === 1 ? "pedido" : "pedidos"}, autorizou receber
            mensagem, e não foi convidado nos últimos 6 meses.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-[17px] font-bold">
              {faltam > 0
                ? `${faltam} ${faltam === 1 ? "cliente" : "clientes"} pra convidar`
                : "Fila concluída"}
            </p>
            {feitos > 0 && (
              <p className="text-[13.5px] text-folha">
                {feitos} {feitos === 1 ? "enviado" : "enviados"}
              </p>
            )}
          </div>

          <Erro texto={falha} />

          {itens.map((i) => {
            const ja = enviados[i.cliente_id];
            const zap = `https://wa.me/55${i.telefone}?text=${encodeURIComponent(i.mensagem)}`;

            return (
              <article
                key={i.cliente_id}
                className={`cartao p-4 transition-opacity ${ja ? "opacity-50" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <p className="text-[16px] font-medium text-creme">{i.nome}</p>
                  <span className="rounded-md bg-folha/15 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-folha">
                    {i.total_pedidos} pedidos
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] text-cinza">{formatarTelefone(i.telefone)}</p>

                <p className="mt-3 break-words rounded-xl border border-borda bg-grelha px-3.5 py-3 text-[14px] leading-relaxed text-fumaca">
                  {i.mensagem}
                </p>

                {ja ? (
                  <p className="mt-3 flex items-center gap-2 text-[14px] font-medium text-folha">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M3 8.5 6.2 11.5 13 4.5"
                        stroke="#4CA46E"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Enviado
                  </p>
                ) : (
                  <a
                    href={zap}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => registrar(i)}
                    className="btn-brasa mt-3 w-full !py-3"
                  >
                    Pedir avaliação no WhatsApp
                  </a>
                )}
              </article>
            );
          })}
        </section>
      )}

      {/* Configuração */}
      <section className="cartao space-y-4 p-5">
        <h2 className="font-display text-[17px] font-bold">Configuração</h2>

        <label className="block">
          <span className="rotulo">Link de avaliação do Google</span>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://g.page/r/..."
            disabled={!podeEditar}
            className="campo"
          />
          <span className="mt-1.5 block text-[12.5px] leading-relaxed text-cinza">
            No Perfil da Empresa no Google, em <strong>Peça avaliações</strong>, tem um botão
            para copiar o link. É esse.
          </span>
        </label>

        <label className="block max-w-[240px]">
          <span className="rotulo">Convidar depois de quantos pedidos</span>
          <input
            value={apos}
            onChange={(e) => setApos(e.target.value.replace(/\D/g, "").slice(0, 2))}
            inputMode="numeric"
            disabled={!podeEditar}
            className="campo"
          />
        </label>

        <label className="block">
          <span className="rotulo">Mensagem</span>
          <textarea
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            rows={4}
            disabled={!podeEditar}
            className="campo resize-y leading-relaxed"
          />
          <span className="mt-1.5 block text-[12.5px] text-cinza">
            Troque <span className="font-mono text-brasa">{"{nome}"}</span>,{" "}
            <span className="font-mono text-brasa">{"{loja}"}</span> e{" "}
            <span className="font-mono text-brasa">{"{link}"}</span> — o sistema preenche.
          </span>
        </label>

        <Erro texto={erroConf} />

        {podeEditar && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={salvar} disabled={ocupado} className="btn-brasa !py-2.5">
              {ocupado ? "Salvando..." : "Salvar"}
            </button>
            {salvo && <span className="text-[14px] text-folha">Salvo.</span>}
          </div>
        )}
      </section>

      <Aviso>
        <strong className="text-creme">O convite vai para todo mundo que bateu o número
        de pedidos.</strong>{" "}
        O sistema não separa quem parece satisfeito de quem não parece, e isso é de
        propósito: filtrar avaliação viola a política do Google e pode derrubar o perfil da
        loja. O perfil no Google é o ativo mais valioso que um restaurante tem na internet —
        não vale o risco por meia estrela.
      </Aviso>
    </div>
  );
}
