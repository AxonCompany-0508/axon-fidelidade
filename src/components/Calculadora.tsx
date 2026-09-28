"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SEGMENTOS,
  brl,
  calcular,
  custoIngrediente,
  pct,
  rotulos,
  segmentoPor,
  veredito,
  type Ingrediente,
  type Medida
} from "@/lib/cmv";
import { MENSAGEM_WHATSAPP, WHATSAPP } from "@/lib/config";

/* ------------------------------------------------------------------ */
/* Tipos da tela — tudo texto, porque o dono digita com vírgula        */
/* ------------------------------------------------------------------ */

type Linha = {
  id: string;
  nome: string;
  medida: Medida;
  precoCompra: string;
  unidadesNoPacote: string;
  quantidadeUsada: string;
};

type Ficha = {
  id: string;
  nomePrato: string;
  segmentoId: string;
  linhas: Linha[];
  custoEmbalagem: string;
  precoVenda: string;
  comissaoApp: string;
  cmvAlvo: string;
  vendasPorDia: string;
  salvoEm: number;
};

const CHAVE = "axon_fichas_v1";

function id() {
  return Math.random().toString(36).slice(2, 9);
}

/** Aceita "12,50", "12.50" e "1.250,00". */
function num(s: string): number {
  if (!s) return 0;
  const t = String(s).trim();
  const limpo = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = Number(limpo);
  return isFinite(n) ? n : 0;
}

function linhaVazia(): Linha {
  return {
    id: id(),
    nome: "",
    medida: "peso",
    precoCompra: "",
    unidadesNoPacote: "",
    quantidadeUsada: ""
  };
}

/** Exemplo pronto: um X-burger simples. Serve de demonstração. */
function exemplo(): Linha[] {
  return [
    { id: id(), nome: "Blend de carne", medida: "peso", precoCompra: "42,00", unidadesNoPacote: "", quantidadeUsada: "150" },
    { id: id(), nome: "Pão brioche", medida: "pacote", precoCompra: "18,00", unidadesNoPacote: "8", quantidadeUsada: "1" },
    { id: id(), nome: "Queijo cheddar", medida: "peso", precoCompra: "48,00", unidadesNoPacote: "", quantidadeUsada: "40" },
    { id: id(), nome: "Molho da casa", medida: "volume", precoCompra: "22,00", unidadesNoPacote: "", quantidadeUsada: "25" }
  ];
}

/* ------------------------------------------------------------------ */
/* Peças de tela                                                       */
/* ------------------------------------------------------------------ */

function Campo({
  rotulo,
  valor,
  ao,
  dica,
  prefixo,
  sufixo,
  largo
}: {
  rotulo: string;
  valor: string;
  ao: (v: string) => void;
  dica?: string;
  prefixo?: string;
  sufixo?: string;
  largo?: boolean;
}) {
  return (
    <label className={largo ? "block sm:col-span-2" : "block"}>
      <span className="rotulo">{rotulo}</span>
      <div className="relative">
        {prefixo && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-cinza">
            {prefixo}
          </span>
        )}
        <input
          value={valor}
          onChange={(e) => ao(e.target.value)}
          placeholder={dica}
          inputMode="decimal"
          className={`campo ${prefixo ? "pl-10" : ""} ${sufixo ? "pr-12" : ""}`}
        />
        {sufixo && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-cinza">
            {sufixo}
          </span>
        )}
      </div>
    </label>
  );
}

function LinhaIngrediente({
  linha,
  ao,
  remover,
  podeRemover
}: {
  linha: Linha;
  ao: (l: Linha) => void;
  remover: () => void;
  podeRemover: boolean;
}) {
  const r = rotulos(linha.medida);
  const custo = custoIngrediente({
    id: linha.id,
    nome: linha.nome,
    medida: linha.medida,
    precoCompra: num(linha.precoCompra),
    unidadesNoPacote: num(linha.unidadesNoPacote),
    quantidadeUsada: num(linha.quantidadeUsada)
  } as Ingrediente);

  return (
    <div className="rounded-xl border border-borda bg-grelha/60 p-3">
      <div className="flex items-start gap-2">
        <input
          value={linha.nome}
          onChange={(e) => ao({ ...linha, nome: e.target.value })}
          placeholder="Ingrediente (ex: blend de carne)"
          className="campo flex-1 !bg-forno font-medium"
        />
        {podeRemover && (
          <button
            type="button"
            onClick={remover}
            aria-label="Remover ingrediente"
            className="mt-0.5 rounded-lg border border-borda p-2.5 text-cinza transition-colors hover:border-tomate hover:text-tomate"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Como compra */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(
          [
            ["peso", "Por quilo"],
            ["volume", "Por litro"],
            ["pacote", "Por pacote"]
          ] as [Medida, string][]
        ).map(([m, texto]) => (
          <button
            key={m}
            type="button"
            onClick={() => ao({ ...linha, medida: m })}
            className={`rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
              linha.medida === m
                ? "bg-brasa text-carvao"
                : "border border-borda text-fumaca hover:text-creme"
            }`}
          >
            {texto}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Campo
          rotulo={r.preco}
          valor={linha.precoCompra}
          ao={(v) => ao({ ...linha, precoCompra: v })}
          prefixo="R$"
          dica="0,00"
        />
        {linha.medida === "pacote" ? (
          <Campo
            rotulo="Vem quantas?"
            valor={linha.unidadesNoPacote}
            ao={(v) => ao({ ...linha, unidadesNoPacote: v })}
            dica="8"
          />
        ) : (
          <Campo
            rotulo={r.usa}
            valor={linha.quantidadeUsada}
            ao={(v) => ao({ ...linha, quantidadeUsada: v })}
            sufixo={r.sufixo}
            dica="0"
          />
        )}
        {linha.medida === "pacote" && (
          <Campo
            rotulo={r.usa}
            valor={linha.quantidadeUsada}
            ao={(v) => ao({ ...linha, quantidadeUsada: v })}
            sufixo="un"
            dica="1"
          />
        )}
      </div>

      <p className="mt-2.5 border-t border-borda pt-2.5 text-[13px] text-fumaca">
        Custa <span className="font-semibold text-brasa-claro">{brl(custo)}</span> dentro do prato
      </p>
    </div>
  );
}

function Numero({
  titulo,
  valor,
  apoio,
  destaque,
  cor
}: {
  titulo: string;
  valor: string;
  apoio?: string;
  destaque?: boolean;
  cor?: string;
}) {
  return (
    <div className={destaque ? "rounded-xl bg-brasa/10 p-3.5 ring-1 ring-brasa/30" : "p-3.5"}>
      <p className="text-[12px] font-medium uppercase tracking-wide text-cinza">{titulo}</p>
      <p
        className={`font-display leading-tight ${destaque ? "mt-1 text-[28px]" : "mt-0.5 text-[22px]"}`}
        style={cor ? { color: cor } : undefined}
      >
        {valor}
      </p>
      {apoio && <p className="mt-0.5 text-[12px] text-fumaca">{apoio}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

export default function Calculadora() {
  const [segmentoId, setSegmentoId] = useState("hamburgueria");
  const [nomePrato, setNomePrato] = useState("");
  const [linhas, setLinhas] = useState<Linha[]>([linhaVazia()]);
  const [custoEmbalagem, setCustoEmbalagem] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [comissaoApp, setComissaoApp] = useState("");
  const [cmvAlvo, setCmvAlvo] = useState("31");
  const [vendasPorDia, setVendasPorDia] = useState("");
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [salvou, setSalvou] = useState(false);

  const seg = segmentoPor(segmentoId);

  // Carrega as fichas salvas só depois de montar, para não brigar com o servidor.
  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE);
      if (bruto) setFichas(JSON.parse(bruto) as Ficha[]);
    } catch {
      /* navegador sem permissão de armazenamento: segue sem fichas */
    }
  }, []);

  function guardar(lista: Ficha[]) {
    setFichas(lista);
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(lista));
    } catch {
      /* sem armazenamento, a ficha vale só nesta aba */
    }
  }

  function trocarSegmento(novo: string) {
    setSegmentoId(novo);
    setCmvAlvo(String(segmentoPor(novo).alvo));
  }

  const resultado = useMemo(
    () =>
      calcular({
        ingredientes: linhas.map((l) => ({
          id: l.id,
          nome: l.nome,
          medida: l.medida,
          precoCompra: num(l.precoCompra),
          unidadesNoPacote: num(l.unidadesNoPacote),
          quantidadeUsada: num(l.quantidadeUsada)
        })),
        custoEmbalagem: num(custoEmbalagem),
        precoVenda: num(precoVenda),
        comissaoApp: num(comissaoApp),
        cmvAlvo: num(cmvAlvo),
        vendasPorDia: num(vendasPorDia),
        diasPorMes: 26
      }),
    [linhas, custoEmbalagem, precoVenda, comissaoApp, cmvAlvo, vendasPorDia]
  );

  const temApp = num(comissaoApp) > 0;
  const diag = veredito(resultado, seg, temApp);
  const temConta = resultado.custoTotal > 0 && num(precoVenda) > 0;

  const CORES: Record<string, string> = {
    folha: "#4CA46E",
    mel: "#F5C441",
    tomate: "#E04A3F"
  };

  function salvarFicha() {
    const nome = nomePrato.trim() || "Prato sem nome";
    const nova: Ficha = {
      id: id(),
      nomePrato: nome,
      segmentoId,
      linhas,
      custoEmbalagem,
      precoVenda,
      comissaoApp,
      cmvAlvo,
      vendasPorDia,
      salvoEm: Date.now()
    };
    guardar([nova, ...fichas].slice(0, 30));
    setSalvou(true);
    window.setTimeout(() => setSalvou(false), 2200);
  }

  function abrirFicha(f: Ficha) {
    setSegmentoId(f.segmentoId);
    setNomePrato(f.nomePrato);
    setLinhas(f.linhas.length ? f.linhas : [linhaVazia()]);
    setCustoEmbalagem(f.custoEmbalagem);
    setPrecoVenda(f.precoVenda);
    setComissaoApp(f.comissaoApp);
    setCmvAlvo(f.cmvAlvo);
    setVendasPorDia(f.vendasPorDia);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const zap = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGEM_WHATSAPP)}`;

  return (
    <div className="grid gap-5 pb-24 lg:grid-cols-[1fr_380px] lg:items-start lg:pb-0">
      {/* Resumo colado no rodapé — só no celular, para o dono não perder o número de vista */}
      {temConta && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-borda bg-forno/95 px-4 py-2.5 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-cinza">Custo</p>
              <p className="font-display text-[17px] leading-tight">{brl(resultado.custoTotal)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-cinza">CMV</p>
              <p
                className="font-display text-[17px] leading-tight"
                style={diag ? { color: CORES[diag.cor] } : undefined}
              >
                {pct(temApp ? resultado.cmvLiquido : resultado.cmvPreco)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-cinza">Sobra</p>
              <p
                className="font-display text-[17px] leading-tight"
                style={resultado.sobraPorPrato < 0 ? { color: CORES.tomate } : undefined}
              >
                {brl(resultado.sobraPorPrato)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Coluna da esquerda: a ficha ---------------- */}
      <div className="space-y-5">
        {/* Tipo de loja */}
        <section className="cartao p-5">
          <h2 className="font-display text-lg font-bold">Que tipo de loja é a sua?</h2>
          <p className="mt-1 text-[14px] text-fumaca">
            É isso que define se o seu número está bom ou ruim. Cada ramo trabalha numa faixa
            diferente.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SEGMENTOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => trocarSegmento(s.id)}
                className={`rounded-xl px-3.5 py-2 text-[14px] font-medium transition-colors ${
                  segmentoId === s.id
                    ? "bg-brasa text-carvao"
                    : "border border-borda text-fumaca hover:border-brasa/50 hover:text-creme"
                }`}
              >
                {s.nome}
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-grelha px-3.5 py-3 text-[13px] leading-relaxed text-fumaca">
            <span className="font-semibold text-creme">
              {seg.nome}: CMV saudável entre {seg.cmvMin}% e {seg.cmvMax}%.
            </span>{" "}
            {seg.nota}
          </p>
        </section>

        {/* Ficha técnica */}
        <section className="cartao p-5">
          <h2 className="font-display text-lg font-bold">O que entra no prato</h2>
          <p className="mt-1 text-[14px] text-fumaca">
            Coloque o preço do jeito que você compra — o quilo, o litro, o pacote — e quanto vai
            em cada porção. A conta de quebrar em grama é por nossa conta.
          </p>

          <label className="mt-4 block">
            <span className="rotulo">Nome do prato</span>
            <input
              value={nomePrato}
              onChange={(e) => setNomePrato(e.target.value)}
              placeholder="X-Bacon, pizza calabresa, marmita grande..."
              className="campo"
            />
          </label>

          <div className="mt-4 space-y-3">
            {linhas.map((l, i) => (
              <LinhaIngrediente
                key={l.id}
                linha={l}
                podeRemover={linhas.length > 1}
                ao={(nova) => setLinhas(linhas.map((x, j) => (j === i ? nova : x)))}
                remover={() => setLinhas(linhas.filter((_, j) => j !== i))}
              />
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setLinhas([...linhas, linhaVazia()])} className="btn-linha">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
              Mais um ingrediente
            </button>
            <button
              type="button"
              onClick={() => {
                setLinhas(exemplo());
                setNomePrato("X-Burger da casa");
                setPrecoVenda("32,00");
                setCustoEmbalagem("1,80");
              }}
              className="btn-linha text-fumaca"
            >
              Ver com um exemplo pronto
            </button>
          </div>

          <div className="mt-5 border-t border-borda pt-4">
            <Campo
              rotulo="Embalagem e descartáveis por pedido"
              valor={custoEmbalagem}
              ao={setCustoEmbalagem}
              prefixo="R$"
              dica="0,00"
            />
            <p className="mt-2 text-[13px] leading-relaxed text-cinza">
              Caixa, saco, guardanapo, sachê, talher, adesivo. Parece pouco, mas é o custo que mais
              some das contas — e em delivery ele come até 6% do pedido.
            </p>
          </div>
        </section>

        {/* Preço e canal */}
        <section className="cartao p-5">
          <h2 className="font-display text-lg font-bold">Por quanto você vende</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo
              rotulo="Preço que o cliente paga"
              valor={precoVenda}
              ao={setPrecoVenda}
              prefixo="R$"
              dica="0,00"
            />
            <Campo
              rotulo="Comissão do aplicativo"
              valor={comissaoApp}
              ao={setComissaoApp}
              sufixo="%"
              dica="0"
            />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-cinza">
            Se você vende no iFood ou parecido, a comissão costuma ficar entre 12% e 30%. Deixe em
            branco ou zero para ver o número de quem compra direto com você — no balcão ou no seu
            WhatsApp.
          </p>

          <div className="mt-5 grid gap-4 border-t border-borda pt-4 sm:grid-cols-2">
            <Campo
              rotulo="CMV que você quer atingir"
              valor={cmvAlvo}
              ao={setCmvAlvo}
              sufixo="%"
              dica={String(seg.alvo)}
            />
            <Campo
              rotulo="Quantos desses você vende por dia"
              valor={vendasPorDia}
              ao={setVendasPorDia}
              dica="0"
            />
          </div>
        </section>

        {/* Fichas salvas */}
        <section className="cartao p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">Minhas fichas</h2>
              <p className="mt-1 text-[14px] text-fumaca">
                Ficam guardadas neste aparelho. Ninguém mais vê.
              </p>
            </div>
            <button type="button" onClick={salvarFicha} className="btn-brasa">
              {salvou ? "Ficha guardada" : "Salvar esta ficha"}
            </button>
          </div>

          {fichas.length > 0 && (
            <ul className="mt-4 divide-y divide-borda overflow-hidden rounded-xl border border-borda">
              {fichas.map((f) => (
                <li key={f.id} className="flex items-center gap-3 bg-grelha/40 px-3.5 py-3">
                  <button
                    type="button"
                    onClick={() => abrirFicha(f)}
                    className="flex-1 text-left transition-colors hover:text-brasa"
                  >
                    <span className="block text-[15px] font-medium">{f.nomePrato}</span>
                    <span className="block text-[12px] text-cinza">
                      {segmentoPor(f.segmentoId).nome} ·{" "}
                      {new Date(f.salvoEm).toLocaleDateString("pt-BR")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => guardar(fichas.filter((x) => x.id !== f.id))}
                    aria-label={`Apagar ${f.nomePrato}`}
                    className="rounded-lg border border-borda p-2 text-cinza transition-colors hover:border-tomate hover:text-tomate"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ---------------- Coluna da direita: o resultado ---------------- */}
      <div className="lg:sticky lg:top-5">
        <section className="cartao overflow-hidden">
          <div className="border-b border-borda bg-grelha/50 px-5 py-4">
            <h2 className="font-display text-lg font-bold">
              {nomePrato.trim() || "Resultado"}
            </h2>
            <p className="mt-0.5 text-[13px] text-fumaca">
              {temConta ? "Atualiza conforme você digita." : "Preencha o preço de venda para ver."}
            </p>
          </div>

          <div className="divide-y divide-borda">
            <div className="grid grid-cols-2 divide-x divide-borda">
              <Numero titulo="Custo do prato" valor={brl(resultado.custoTotal)} />
              <Numero
                titulo={temApp ? "CMV no app" : "CMV"}
                valor={temConta ? pct(temApp ? resultado.cmvLiquido : resultado.cmvPreco) : "—"}
                cor={diag ? CORES[diag.cor] : undefined}
              />
            </div>

            <div className="px-1.5 py-1.5">
              <Numero
                titulo="Sobra por prato"
                valor={temConta ? brl(resultado.sobraPorPrato) : "—"}
                apoio={
                  temConta
                    ? `${pct(resultado.margemPct)} do preço · antes de aluguel, folha e energia${temApp ? ` · app leva ${brl(resultado.comissaoValor)}` : ""}`
                    : undefined
                }
                destaque
                cor={resultado.sobraPorPrato < 0 ? CORES.tomate : undefined}
              />
            </div>

            <div className="grid grid-cols-2 divide-x divide-borda">
              <Numero
                titulo={`Preço p/ CMV de ${num(cmvAlvo) || seg.alvo}%`}
                valor={resultado.custoTotal > 0 ? brl(resultado.precoIdeal) : "—"}
              />
              <Numero
                titulo="Preço de empate"
                valor={resultado.custoTotal > 0 ? brl(resultado.precoEmpate) : "—"}
                apoio="abaixo disso, prejuízo"
              />
            </div>

            {num(vendasPorDia) > 0 && temConta && (
              <div className="bg-grelha/40 px-5 py-4">
                <p className="text-[12px] font-medium uppercase tracking-wide text-cinza">
                  No mês, vendendo {num(vendasPorDia)} por dia
                </p>
                <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-display text-[24px] leading-none">
                    {brl(resultado.sobraNoMes)}
                  </span>
                  <span className="text-[13px] text-fumaca">sobram hoje, antes das despesas fixas</span>
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-fumaca">
                  No preço ideal seriam{" "}
                  <span className="font-semibold text-brasa-claro">
                    {brl(resultado.sobraNoMesIdeal)}
                  </span>{" "}
                  — diferença de{" "}
                  <span className="font-semibold text-creme">
                    {brl(resultado.sobraNoMesIdeal - resultado.sobraNoMes)}
                  </span>{" "}
                  por mês, só nesse prato. Contando 26 dias de operação.
                </p>
              </div>
            )}
          </div>

          {diag && temConta && (
            <div
              className="border-t border-borda px-5 py-4"
              style={{ backgroundColor: `${CORES[diag.cor]}12` }}
            >
              <p className="font-semibold" style={{ color: CORES[diag.cor] }}>
                {diag.titulo}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-fumaca">{diag.texto}</p>
            </div>
          )}
        </section>

        {/* Chamada */}
        <section className="cartao mt-5 p-5">
          <h3 className="font-display text-[17px] font-bold leading-snug">
            Descobriu o número. E agora?
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-fumaca">
            Saber o CMV é o primeiro passo. O segundo é fazer o cliente voltar — porque margem boa
            com salão vazio não paga conta. Manda uma mensagem e eu te mostro como a gente resolve
            isso.
          </p>
          <a href={zap} target="_blank" rel="noreferrer" className="btn-brasa mt-4 w-full">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.13c-.25.69-1.44 1.32-1.98 1.37-.54.05-1.04.24-3.5-.73-2.95-1.17-4.8-4.24-4.95-4.44-.14-.2-1.17-1.56-1.17-2.98 0-1.41.74-2.11 1-2.4.26-.29.57-.37.76-.37h.55c.18 0 .42-.07.65.5.24.59.8 2 .87 2.14.07.15.12.32.02.51-.1.2-.15.32-.3.5l-.44.51c-.15.15-.3.31-.13.6.17.3.75 1.24 1.6 2 1.1.98 2.02 1.29 2.31 1.44.29.15.46.12.63-.07.17-.2.73-.85.93-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.74-.18 1.43z" />
            </svg>
            Falar no WhatsApp
          </a>
          <p className="mt-3 text-center text-[12px] text-cinza">
            Sem cadastro, sem compromisso.
          </p>
        </section>
      </div>
    </div>
  );
}
