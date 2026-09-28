"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Erro } from "@/components/ui";
import { criarCliente } from "@/lib/supabase/client";
import { formatarEnquantoDigita, formatarTelefone, soDigitos, telefoneValido } from "@/lib/telefone";

type Achado = {
  id: string;
  nome: string;
  telefone: string;
  selos: number;
  total_pedidos: number;
  ultimo_pedido_em: string | null;
};

type Tela = "busca" | "ficha" | "novo";

/** Fileira de bolinhas do cartão, versão pequena. */
function Selinhos({ selos, meta }: { selos: number; meta: number }) {
  const cheios = Math.min(selos, meta);
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: meta }).map((_, i) => (
        <span
          key={i}
          className={`h-3 w-3 rounded-full ${
            i < cheios ? "bg-brasa" : "border border-dashed border-borda"
          }`}
        />
      ))}
    </div>
  );
}

export default function Balcao({
  lojaId,
  meta,
  premio
}: {
  lojaId: string;
  meta: number;
  premio: string;
}) {
  const [tela, setTela] = useState<Tela>("busca");
  const [busca, setBusca] = useState("");
  const [achados, setAchados] = useState<Achado[]>([]);
  const [procurando, setProcurando] = useState(false);
  const [atual, setAtual] = useState<Achado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  // Último pedido lançado, para o botão de desfazer.
  const [ultimoPedido, setUltimoPedido] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [novoNome, setNovoNome] = useState("");
  const [novoTel, setNovoTel] = useState("");

  const campoBusca = useRef<HTMLInputElement>(null);

  const procurar = useCallback(
    async (texto: string) => {
      if (texto.trim().length < 2) {
        setAchados([]);
        return;
      }
      setProcurando(true);
      const { data, error } = await criarCliente().rpc("buscar_cliente", {
        p_loja: lojaId,
        p_busca: texto
      });
      setProcurando(false);
      if (error) {
        setErro(error.message);
        return;
      }
      setAchados((data as Achado[]) || []);
    },
    [lojaId]
  );

  // Espera a pessoa parar de digitar antes de ir no banco.
  useEffect(() => {
    if (tela !== "busca") return;
    const t = window.setTimeout(() => procurar(busca), 300);
    return () => window.clearTimeout(t);
  }, [busca, tela, procurar]);

  function abrir(c: Achado) {
    setAtual(c);
    setTela("ficha");
    setErro(null);
    setAviso(null);
    setUltimoPedido(null);
  }

  function voltar() {
    setTela("busca");
    setAtual(null);
    setErro(null);
    setAviso(null);
    setUltimoPedido(null);
    setBusca("");
    setAchados([]);
    window.setTimeout(() => campoBusca.current?.focus(), 50);
  }

  async function marcar() {
    if (!atual) return;
    setErro(null);
    setOcupado(true);

    const { data, error } = await criarCliente()
      .from("pedidos")
      .insert({ loja_id: lojaId, cliente_id: atual.id })
      .select("id")
      .single();

    setOcupado(false);

    if (error) {
      setErro(error.message);
      return;
    }

    const novos = atual.selos + 1;
    setAtual({ ...atual, selos: novos, total_pedidos: atual.total_pedidos + 1 });
    setUltimoPedido((data as { id: string }).id);
    setAviso(novos >= meta ? "Selo marcado. O prêmio liberou!" : "Selo marcado.");
  }

  async function desfazer() {
    if (!ultimoPedido || !atual) return;
    setOcupado(true);
    const { error } = await criarCliente().from("pedidos").delete().eq("id", ultimoPedido);
    setOcupado(false);

    if (error) {
      setErro("Não deu pra desfazer. Pedidos só podem ser apagados nos primeiros 15 minutos.");
      return;
    }
    setAtual({
      ...atual,
      selos: Math.max(atual.selos - 1, 0),
      total_pedidos: Math.max(atual.total_pedidos - 1, 0)
    });
    setUltimoPedido(null);
    setAviso("Pedido desfeito.");
  }

  async function resgatar() {
    if (!atual) return;
    setErro(null);
    setOcupado(true);

    const { error } = await criarCliente().rpc("resgatar_premio", { p_cliente: atual.id });
    setOcupado(false);

    if (error) {
      setErro(error.message);
      return;
    }

    setAtual({ ...atual, selos: Math.max(atual.selos - meta, 0) });
    setUltimoPedido(null);
    setAviso(`Prêmio entregue: ${premio}.`);
  }

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!novoNome.trim()) {
      setErro("Escreva o nome.");
      return;
    }
    if (!telefoneValido(novoTel)) {
      setErro("Confira o número. Precisa ter o DDD.");
      return;
    }

    setOcupado(true);
    const { data, error } = await criarCliente().rpc("cadastrar_pelo_balcao", {
      p_loja: lojaId,
      p_nome: novoNome.trim(),
      p_telefone: soDigitos(novoTel)
    });
    setOcupado(false);

    if (error || !data) {
      setErro(error?.message || "Não consegui cadastrar.");
      return;
    }

    setAtual({
      id: data as string,
      nome: novoNome.trim(),
      telefone: soDigitos(novoTel),
      selos: 0,
      total_pedidos: 0,
      ultimo_pedido_em: null
    });
    setNovoNome("");
    setNovoTel("");
    setTela("ficha");
    setAviso("Cliente cadastrado. Agora marque o pedido.");
  }

  /* ---------------------------------------------------------------- */

  if (tela === "novo") {
    return (
      <form onSubmit={cadastrar} className="cartao space-y-4 p-5">
        <div>
          <h2 className="font-display text-[19px] font-bold">Cliente novo</h2>
          <p className="mt-1 text-[14px] text-fumaca">
            Dois campos e ele já sai daqui com o cartão dele.
          </p>
        </div>

        <label className="block">
          <span className="rotulo">Nome</span>
          <input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Primeiro nome já serve"
            className="campo !py-3.5 !text-[17px]"
            autoFocus
          />
        </label>

        <label className="block">
          <span className="rotulo">WhatsApp</span>
          <input
            value={novoTel}
            onChange={(e) => setNovoTel(formatarEnquantoDigita(e.target.value))}
            placeholder="(14) 99999-0000"
            inputMode="numeric"
            className="campo !py-3.5 !text-[17px]"
          />
        </label>

        <Erro texto={erro} />

        <div className="flex gap-2">
          <button type="submit" disabled={ocupado} className="btn-brasa flex-1 !py-4">
            {ocupado ? "Salvando..." : "Cadastrar"}
          </button>
          <button type="button" onClick={voltar} className="btn-linha">
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  if (tela === "ficha" && atual) {
    const liberado = atual.selos >= meta;

    return (
      <div className="space-y-4">
        <section className={`cartao p-5 ${liberado ? "!border-brasa" : ""}`}>
          <p className="font-display text-[24px] font-bold leading-tight">{atual.nome}</p>
          <p className="mt-0.5 text-[14px] text-fumaca">{formatarTelefone(atual.telefone)}</p>

          <div className="mt-4 flex items-baseline justify-between gap-3">
            <p className="text-[12px] font-medium uppercase tracking-wide text-cinza">Selos</p>
            <p className="font-display text-[18px] font-bold">
              {Math.min(atual.selos, meta)} de {meta}
            </p>
          </div>
          <div className="mt-2">
            <Selinhos selos={atual.selos} meta={meta} />
          </div>

          {atual.total_pedidos > 0 && (
            <p className="mt-3 text-[13px] text-cinza">
              {atual.total_pedidos} {atual.total_pedidos === 1 ? "pedido" : "pedidos"} no total
            </p>
          )}
        </section>

        {aviso && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-folha/40 bg-folha/10 px-4 py-3">
            <p className="text-[14.5px] font-medium text-folha">{aviso}</p>
            {ultimoPedido && (
              <button
                type="button"
                onClick={desfazer}
                disabled={ocupado}
                className="shrink-0 text-[14px] font-semibold text-fumaca underline underline-offset-2 hover:text-tomate"
              >
                Desfazer
              </button>
            )}
          </div>
        )}

        <Erro texto={erro} />

        {liberado && (
          <button
            type="button"
            onClick={resgatar}
            disabled={ocupado}
            className="w-full rounded-2xl border-2 border-brasa bg-brasa/15 px-4 py-5 text-center transition-colors hover:bg-brasa/25 disabled:opacity-50"
          >
            <span className="block font-display text-[19px] font-bold text-brasa">
              Entregar {premio}
            </span>
            <span className="mt-0.5 block text-[13px] text-fumaca">
              Some {meta} selos do cartão dele
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={marcar}
          disabled={ocupado}
          className="w-full rounded-2xl bg-brasa px-4 py-6 font-display text-[22px] font-extrabold text-carvao transition-colors hover:bg-brasa-claro active:bg-brasa-escuro disabled:opacity-50"
        >
          {ocupado ? "..." : "+ 1 selo"}
        </button>

        <button type="button" onClick={voltar} className="btn-linha w-full">
          Atender o próximo
        </button>
      </div>
    );
  }

  /* ------------------------------- busca ------------------------------- */

  return (
    <div className="space-y-4">
      <input
        ref={campoBusca}
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Telefone ou nome"
        inputMode="text"
        autoFocus
        className="campo !py-4 !text-[18px]"
      />

      <Erro texto={erro} />

      {busca.trim().length < 2 ? (
        <section className="cartao p-6 text-center">
          <p className="text-[15px] leading-relaxed text-fumaca">
            Peça o telefone e digite aqui. Pode ser só o final do número.
          </p>
        </section>
      ) : procurando && achados.length === 0 ? (
        <section className="cartao p-6 text-center text-[15px] text-cinza">Procurando...</section>
      ) : achados.length === 0 ? (
        <section className="cartao p-6 text-center">
          <p className="text-[15px] text-fumaca">Ninguém com esse número ou nome.</p>
          <button
            type="button"
            onClick={() => {
              const d = soDigitos(busca);
              if (d.length >= 10) setNovoTel(formatarEnquantoDigita(d));
              else setNovoNome(busca.trim());
              setTela("novo");
              setErro(null);
            }}
            className="btn-brasa mt-4"
          >
            Cadastrar agora
          </button>
        </section>
      ) : (
        <ul className="divide-y divide-borda overflow-hidden rounded-2xl border border-borda bg-forno">
          {achados.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => abrir(c)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-grelha"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-medium text-creme">{c.nome}</p>
                  <p className="mt-0.5 text-[13.5px] text-fumaca">
                    {formatarTelefone(c.telefone)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`font-display text-[17px] font-bold ${
                      c.selos >= meta ? "text-brasa" : "text-creme"
                    }`}
                  >
                    {Math.min(c.selos, meta)}/{meta}
                  </p>
                  {c.selos >= meta && (
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brasa">
                      prêmio
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {busca.trim().length >= 2 && achados.length > 0 && (
        <button
          type="button"
          onClick={() => {
            const d = soDigitos(busca);
            if (d.length >= 10) setNovoTel(formatarEnquantoDigita(d));
            setTela("novo");
            setErro(null);
          }}
          className="btn-linha w-full"
        >
          Não é nenhum desses — cadastrar novo
        </button>
      )}
    </div>
  );
}
