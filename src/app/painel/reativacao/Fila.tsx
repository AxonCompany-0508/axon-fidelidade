"use client";

import { useState } from "react";
import { Erro } from "@/components/ui";
import { criarCliente } from "@/lib/supabase/client";
import { formatarTelefone } from "@/lib/telefone";
import type { NaFila } from "./page";

export default function Fila({
  itens,
  erro,
  cooldown
}: {
  itens: NaFila[];
  erro: string | null;
  cooldown: number;
}) {
  const [enviados, setEnviados] = useState<Record<string, boolean>>({});
  const [falha, setFalha] = useState<string | null>(null);

  async function registrar(i: NaFila) {
    setEnviados((e) => ({ ...e, [i.cliente_id]: true }));
    const { error } = await criarCliente().rpc("registrar_envio", {
      p_cliente: i.cliente_id,
      p_campanha: i.campanha_id
    });
    if (error) {
      setFalha(
        "Abri o WhatsApp, mas não consegui anotar o envio. Essa pessoa pode aparecer na fila de novo."
      );
    }
  }

  const feitos = Object.keys(enviados).length;
  const faltam = itens.length - feitos;

  if (erro) {
    return <Erro texto={erro} />;
  }

  if (itens.length === 0) {
    return (
      <section className="cartao p-8 text-center">
        <p className="font-display text-[18px] font-bold">Ninguém pra chamar hoje</p>
        <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-fumaca">
          A fila fica vazia quando ninguém passou do prazo, quando os clientes ainda não
          autorizaram receber mensagem, ou quando todos já foram chamados nos últimos{" "}
          {cooldown} dias.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-[17px] font-bold">
          {faltam > 0
            ? `${faltam} ${faltam === 1 ? "pessoa" : "pessoas"} pra chamar`
            : "Fila concluída"}
        </p>
        {feitos > 0 && (
          <p className="text-[13.5px] text-folha">
            {feitos} {feitos === 1 ? "enviada" : "enviadas"}
          </p>
        )}
      </div>

      <Erro texto={falha} />

      {itens.map((i) => {
        const ja = enviados[i.cliente_id];
        const zap = `https://wa.me/55${i.telefone}?text=${encodeURIComponent(i.mensagem)}`;
        const aniversario = i.tipo === "aniversario";

        return (
          <article
            key={i.cliente_id}
            className={`cartao p-4 transition-opacity ${ja ? "opacity-50" : ""}`}
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <p className="text-[16px] font-medium text-creme">{i.nome}</p>
              <span
                className="rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
                style={
                  aniversario
                    ? { color: "#16D2A6", backgroundColor: "#16D2A61A" }
                    : { color: "#E04A3F", backgroundColor: "#E04A3F1A" }
                }
              >
                {aniversario ? "Aniversário" : `${i.dias_sem_pedir} dias sem pedir`}
              </span>
            </div>

            <p className="mt-0.5 text-[13px] text-cinza">{formatarTelefone(i.telefone)}</p>

            <p className="mt-3 rounded-xl border border-borda bg-grelha px-3.5 py-3 text-[14px] leading-relaxed text-fumaca">
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.13c-.25.69-1.44 1.32-1.98 1.37-.54.05-1.04.24-3.5-.73-2.95-1.17-4.8-4.24-4.95-4.44-.14-.2-1.17-1.56-1.17-2.98 0-1.41.74-2.11 1-2.4.26-.29.57-.37.76-.37h.55c.18 0 .42-.07.65.5.24.59.8 2 .87 2.14.07.15.12.32.02.51-.1.2-.15.32-.3.5l-.44.51c-.15.15-.3.31-.13.6.17.3.75 1.24 1.6 2 1.1.98 2.02 1.29 2.31 1.44.29.15.46.12.63-.07.17-.2.73-.85.93-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.74-.18 1.43z" />
                </svg>
                Enviar no WhatsApp
              </a>
            )}
          </article>
        );
      })}

      <p className="pt-1 text-[13px] leading-relaxed text-cinza">
        A mensagem sai do seu próprio WhatsApp, com o seu número. Não é robô: o cliente
        responde e cai na sua conversa normal.
      </p>
    </section>
  );
}
