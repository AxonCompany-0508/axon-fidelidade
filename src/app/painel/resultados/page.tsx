import Link from "next/link";
import TicketMedio from "./TicketMedio";
import { Aviso, Titulo } from "@/components/ui";
import { sessaoAtual } from "@/lib/loja";
import { criarClienteServidor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Resultado = {
  chamados: number;
  voltaram: number;
  pedidos_recuperados: number;
  novos_clientes: number;
  pedidos_total: number;
  premios_entregues: number;
  base_total: number;
  base_com_contato: number;
};

const PERIODOS = [
  { dias: 30, texto: "30 dias" },
  { dias: 90, texto: "90 dias" },
  { dias: 3650, texto: "Tudo" }
];

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PaginaResultados({
  searchParams
}: {
  searchParams: { p?: string };
}) {
  const { loja, papel } = await sessaoAtual();
  const dias = PERIODOS.some((x) => String(x.dias) === searchParams.p)
    ? Number(searchParams.p)
    : 90;

  const { data } = await criarClienteServidor().rpc("resultados", {
    p_loja: loja.id,
    p_dias: dias
  });

  const r = ((data as Resultado[]) || [])[0] || {
    chamados: 0,
    voltaram: 0,
    pedidos_recuperados: 0,
    novos_clientes: 0,
    pedidos_total: 0,
    premios_entregues: 0,
    base_total: 0,
    base_com_contato: 0
  };

  const taxa = r.chamados > 0 ? Math.round((r.voltaram / r.chamados) * 100) : 0;
  const ticket = loja.ticket_medio ? Number(loja.ticket_medio) : null;
  const emReais = ticket ? r.pedidos_recuperados * ticket : null;

  return (
    <>
      <Titulo texto="Resultados" apoio="O que a ferramenta trouxe de volta" />

      {/* Período */}
      <div className="mb-5 flex gap-2">
        {PERIODOS.map((p) => (
          <Link
            key={p.dias}
            href={`/painel/resultados?p=${p.dias}`}
            className={`rounded-xl px-3.5 py-2 text-[14px] font-medium transition-colors ${
              p.dias === dias
                ? "bg-brasa text-carvao"
                : "border border-borda text-fumaca hover:border-brasa/50 hover:text-creme"
            }`}
          >
            {p.texto}
          </Link>
        ))}
      </div>

      {/* O número que importa */}
      <section className="cartao overflow-hidden">
        <div className="border-b border-borda bg-brasa/[0.07] px-5 py-6">
          {r.chamados === 0 ? (
            <>
              <p className="font-display text-[22px] font-bold leading-tight">
                Nenhuma mensagem enviada ainda
              </p>
              <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-fumaca">
                Assim que você começar a chamar gente de volta, esta tela mostra quantos
                voltaram de verdade. É o número que responde se vale a pena continuar.
              </p>
              <Link href="/painel/reativacao" className="btn-brasa mt-4">
                Ver quem chamar
              </Link>
            </>
          ) : (
            <>
              <p className="text-[12px] font-medium uppercase tracking-wide text-cinza">
                Clientes que voltaram depois da mensagem
              </p>
              <p className="mt-1.5 font-display text-[46px] leading-none text-brasa">
                {r.voltaram}
              </p>
              <p className="mt-2 text-[15px] text-fumaca">
                de {r.chamados} {r.chamados === 1 ? "pessoa chamada" : "pessoas chamadas"} ·{" "}
                <span className="font-semibold text-creme">{taxa}% voltaram</span>
              </p>

              {emReais !== null && (
                <p className="mt-4 rounded-xl border border-borda bg-grelha px-4 py-3 text-[14.5px] leading-relaxed text-fumaca">
                  Isso deu <span className="font-semibold text-creme">{r.pedidos_recuperados}</span>{" "}
                  {r.pedidos_recuperados === 1 ? "pedido" : "pedidos"}, ou cerca de{" "}
                  <span className="font-semibold text-brasa-claro">{brl(emReais)}</span> —
                  estimado pelo ticket médio de {brl(ticket!)} que você informou.
                </p>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-borda sm:grid-cols-4 sm:divide-y-0">
          <Bloco rotulo="Clientes novos" valor={r.novos_clientes} />
          <Bloco rotulo="Pedidos marcados" valor={r.pedidos_total} />
          <Bloco rotulo="Prêmios entregues" valor={r.premios_entregues} />
          <Bloco
            rotulo="Base total"
            valor={r.base_total}
            apoio={`${r.base_com_contato} autorizaram mensagem`}
          />
        </div>
      </section>

      <div className="mt-5">
        <TicketMedio
          lojaId={loja.id}
          atual={ticket}
          podeEditar={papel === "dono" || papel === "gerente"}
        />
      </div>

      <div className="mt-5">
        <Aviso>
          <strong className="text-creme">Como a conta é feita:</strong> contamos como
          &quot;voltou&quot; quem fez um pedido em até 14 dias depois de receber a mensagem.
          Não é exato — a pessoa podia ter voltado de qualquer jeito — mas é o que dá pra
          medir sem inventar número. Prefiro te dar o número honesto do que um número bonito.
        </Aviso>
      </div>
    </>
  );
}

function Bloco({
  rotulo,
  valor,
  apoio
}: {
  rotulo: string;
  valor: number;
  apoio?: string;
}) {
  return (
    <div className="p-4">
      <p className="text-[11.5px] font-medium uppercase tracking-wide text-cinza">{rotulo}</p>
      <p className="mt-1 font-display text-[24px] leading-none text-creme">{valor}</p>
      {apoio && <p className="mt-1.5 text-[11.5px] leading-snug text-cinza">{apoio}</p>}
    </div>
  );
}
