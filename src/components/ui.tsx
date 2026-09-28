"use client";

import type { ReactNode } from "react";

/** Campo de texto com rótulo. */
export function Campo({
  rotulo,
  valor,
  ao,
  tipo = "text",
  dica,
  auto,
  modo,
  obrigatorio
}: {
  rotulo: string;
  valor: string;
  ao: (v: string) => void;
  tipo?: string;
  dica?: string;
  auto?: string;
  modo?: "text" | "tel" | "email" | "numeric" | "decimal";
  obrigatorio?: boolean;
}) {
  return (
    <label className="block">
      <span className="rotulo">{rotulo}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => ao(e.target.value)}
        placeholder={dica}
        autoComplete={auto}
        inputMode={modo}
        required={obrigatorio}
        className="campo"
      />
    </label>
  );
}

/** Caixa de erro. Aparece só quando tem o que dizer. */
export function Erro({ texto }: { texto: string | null }) {
  if (!texto) return null;
  return (
    <div className="rounded-xl border border-tomate/40 bg-tomate/10 px-3.5 py-3">
      <p className="text-[14px] leading-relaxed text-tomate">{texto}</p>
    </div>
  );
}

/** Caixa de aviso neutra. */
export function Aviso({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-borda bg-grelha px-3.5 py-3 text-[13.5px] leading-relaxed text-fumaca">
      {children}
    </div>
  );
}

/** Botão principal, laranja. */
export function Botao({
  children,
  tipo = "button",
  ao,
  carregando,
  largura
}: {
  children: ReactNode;
  tipo?: "button" | "submit";
  ao?: () => void;
  carregando?: boolean;
  largura?: boolean;
}) {
  return (
    <button
      type={tipo}
      onClick={ao}
      disabled={carregando}
      className={`btn-brasa ${largura ? "w-full" : ""}`}
    >
      {carregando ? "Aguarde..." : children}
    </button>
  );
}

/** Cabeçalho de página dentro do painel. */
export function Titulo({ texto, apoio }: { texto: string; apoio?: string }) {
  return (
    <header className="mb-5">
      <h1 className="font-display text-[26px] font-bold leading-tight">{texto}</h1>
      {apoio && <p className="mt-1 text-[14.5px] text-fumaca">{apoio}</p>}
    </header>
  );
}
