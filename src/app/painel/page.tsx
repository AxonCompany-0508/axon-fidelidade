import Link from "next/link";
import { Titulo } from "@/components/ui";
import { sessaoAtual } from "@/lib/loja";
import { nomeDoTipo } from "@/lib/tipos";
import { criarClienteServidor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Linha = {
  ultimo_pedido_em: string | null;
  aniversario: string | null;
  consentimento_em: string | null;
};

export default async function Inicio() {
  const { loja, nomeUsuario } = await sessaoAtual();
  const primeiroNome = nomeUsuario.split(" ")[0] || "bem-vindo";

  const supabase = criarClienteServidor();
  const [lista, fila] = await Promise.all([
    supabase
      .from("clientes")
      .select("ultimo_pedido_em, aniversario, consentimento_em")
      .eq("loja_id", loja.id),
    supabase.rpc("fila_de_hoje", { p_loja: loja.id })
  ]);

  const clientes = (lista.data as Linha[]) || [];
  const naFila = ((fila.data as unknown[]) || []).length;
  const agora = Date.now();
  const mesAtual = new Date().getMonth() + 1;

  const diasSem = (d: string | null) =>
    d === null ? null : Math.floor((agora - new Date(d).getTime()) / 86400000);

  const casa = clientes.filter((c) => {
    const d = diasSem(c.ultimo_pedido_em);
    return d !== null && d <= loja.dias_risco;
  }).length;

  const sumindo = clientes.filter((c) => {
    const d = diasSem(c.ultimo_pedido_em);
    return d !== null && d > loja.dias_risco && d <= loja.dias_inativo;
  }).length;

  const sumiu = clientes.filter((c) => {
    const d = diasSem(c.ultimo_pedido_em);
    return d !== null && d > loja.dias_inativo;
  }).length;

  const aniversariantes = clientes.filter(
    (c) => c.aniversario && Number(c.aniversario.slice(5, 7)) === mesAtual
  ).length;

  const cartoes = [
    { rotulo: "Clientes da casa", valor: casa, apoio: `pediram nos últimos ${loja.dias_risco} dias`, cor: "#4CA46E" },
    { rotulo: "Sumindo", valor: sumindo, apoio: "estão esfriando", cor: "#F5C441" },
    { rotulo: "Sumiu", valor: sumiu, apoio: "hora de chamar de volta", cor: "#E04A3F" },
    { rotulo: "Aniversariantes", valor: aniversariantes, apoio: "fazem aniversário este mês", cor: "#16D2A6" }
  ];

  const semNinguem = clientes.length === 0;

  return (
    <>
      <Titulo texto={`Olá, ${primeiroNome}`} apoio={`${loja.nome} · ${nomeDoTipo(loja.tipo)}`} />

      {/* O atalho que o atendente usa o dia inteiro */}
      <Link
        href="/painel/marcar"
        className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-brasa px-5 py-4 transition-colors hover:bg-brasa-claro"
      >
        <span>
          <span className="block font-display text-[19px] font-extrabold leading-tight text-carvao">
            Marcar pedido
          </span>
          <span className="block text-[13px] font-medium text-carvao/70">
            Cliente no balcão? Dá o selo aqui
          </span>
        </span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9 6l6 6-6 6"
            stroke="#100C09"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {naFila > 0 && (
        <Link
          href="/painel/reativacao"
          className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-tomate/40 bg-tomate/10 px-5 py-4 transition-colors hover:bg-tomate/15"
        >
          <span>
            <span className="block font-display text-[17px] font-bold leading-tight text-tomate">
              {naFila} {naFila === 1 ? "pessoa esperando" : "pessoas esperando"} ser
              {naFila === 1 ? "" : "em"} chamada{naFila === 1 ? "" : "s"}
            </span>
            <span className="block text-[13px] text-fumaca">
              Mensagem já escrita. É só mandar.
            </span>
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 6l6 6-6 6"
              stroke="#E04A3F"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cartoes.map((c) => (
          <div key={c.rotulo} className="cartao p-4">
            <p className="text-[12px] font-medium uppercase tracking-wide text-cinza">
              {c.rotulo}
            </p>
            <p
              className="mt-1 font-display text-[28px] leading-none"
              style={{ color: c.valor > 0 ? c.cor : "#6D6158" }}
            >
              {c.valor}
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-cinza">{c.apoio}</p>
          </div>
        ))}
      </div>

      {semNinguem ? (
        <section className="cartao mt-5 p-5">
          <h2 className="font-display text-[18px] font-bold">
            Falta uma coisa: colocar o QR no balcão
          </h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-fumaca">
            Enquanto ninguém escanear, estes números ficam zerados. Imprima o cartaz,
            deixe na frente da máquina de cartão, e peça pro atendente falar uma frase:
            <span className="mt-2 block rounded-lg border border-borda bg-grelha px-3.5 py-2.5 italic text-creme">
              &quot;Aponta a câmera aqui, a cada {loja.selos_para_premio} pedidos o{" "}
              {loja.nome_premio.replace(/^um[a]? /, "")} é por nossa conta.&quot;
            </span>
          </p>
          <Link href="/painel/qrcode" className="btn-brasa mt-4">
            Imprimir meu cartaz
          </Link>
        </section>
      ) : (
        <section className="cartao mt-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[18px] font-bold">
                {clientes.length}{" "}
                {clientes.length === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}
              </h2>
              <p className="mt-1 text-[14px] text-fumaca">
                A cada {loja.selos_para_premio} pedidos, {loja.nome_premio}
              </p>
            </div>
            <Link href="/painel/clientes" className="btn-linha">
              Ver clientes
            </Link>
          </div>
        </section>
      )}

      <section className="cartao mt-5 p-5">
        <h2 className="font-display text-[17px] font-bold">Dados da loja</h2>
        <dl className="mt-4 divide-y divide-borda">
          <Item rotulo="Nome" valor={loja.nome} />
          <Item rotulo="Ramo" valor={nomeDoTipo(loja.tipo)} />
          <Item rotulo="Página do cliente" valor={`/c/${loja.slug}`} />
          <Item
            rotulo="Regra do cartão"
            valor={`${loja.selos_para_premio} pedidos = ${loja.nome_premio}`}
          />
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/painel/cartao" className="btn-linha">
            Mudar a regra
          </Link>
          <Link href="/painel/conta" className="btn-linha">
            Dados da loja
          </Link>
        </div>
      </section>
    </>
  );
}

function Item({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-[14px] text-fumaca">{rotulo}</dt>
      <dd className="text-right text-[14.5px] font-medium text-creme">{valor}</dd>
    </div>
  );
}
