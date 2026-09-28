"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Simbolo } from "@/components/Marca";
import { criarCliente } from "@/lib/supabase/client";

type Item = {
  href: string;
  texto: string;
  icone: ReactNode;
  pronto: boolean;
};

function I({ d }: { d: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MENU: Item[] = [
  {
    href: "/painel",
    texto: "Início",
    pronto: true,
    icone: <I d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z" />
  },
  {
    href: "/painel/marcar",
    texto: "Marcar pedido",
    pronto: false,
    icone: <I d="M12 5v14M5 12h14" />
  },
  {
    href: "/painel/clientes",
    texto: "Clientes",
    pronto: false,
    icone: <I d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-1.5a4 4 0 0 0-3-3.87M16.5 3.6a4 4 0 0 1 0 7.75" />
  },
  {
    href: "/painel/cartao",
    texto: "Cartão fidelidade",
    pronto: false,
    icone: <I d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-9ZM3 10h18M7 14h3" />
  },
  {
    href: "/painel/reativacao",
    texto: "Chamar de volta",
    pronto: false,
    icone: <I d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.5l1.5-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z" />
  },
  {
    href: "/painel/qrcode",
    texto: "QR code",
    pronto: false,
    icone: <I d="M4 4h6v6H4V4ZM14 4h6v6h-6V4ZM4 14h6v6H4v-6ZM14 14h2.5v2.5H14V14ZM20 14v6h-3.5" />
  },
  {
    href: "/painel/conta",
    texto: "Conta",
    pronto: true,
    icone: <I d="M12 14.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM4.5 20.5a7.5 7.5 0 0 1 15 0" />
  }
];

function Links({ aoClicar }: { aoClicar?: () => void }) {
  const caminho = usePathname();

  return (
    <nav className="space-y-0.5">
      {MENU.map((item) => {
        const ativo =
          item.href === "/painel" ? caminho === "/painel" : caminho.startsWith(item.href);

        if (!item.pronto) {
          return (
            <div
              key={item.href}
              className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-cinza"
              title="Ainda vamos construir esta parte"
            >
              {item.icone}
              <span className="flex-1">{item.texto}</span>
              <span className="rounded-md bg-grelha px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cinza">
                em breve
              </span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={aoClicar}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${
              ativo
                ? "bg-brasa/15 font-semibold text-brasa"
                : "text-fumaca hover:bg-grelha hover:text-creme"
            }`}
          >
            {item.icone}
            {item.texto}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Estrutura({
  nomeLoja,
  nomeUsuario,
  children
}: {
  nomeLoja: string;
  nomeUsuario: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [gaveta, setGaveta] = useState(false);

  async function sair() {
    await criarCliente().auth.signOut();
    router.push("/entrar");
    router.refresh();
  }

  const rodape = (
    <div className="border-t border-borda pt-3">
      <p className="px-3 text-[13px] text-cinza">{nomeUsuario}</p>
      <button
        type="button"
        onClick={sair}
        className="mt-1 w-full rounded-xl px-3 py-2 text-left text-[14px] text-fumaca transition-colors hover:bg-grelha hover:text-tomate"
      >
        Sair
      </button>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Barra lateral — computador */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-borda bg-forno p-4 lg:flex">
        <div className="mb-6 flex items-center gap-2.5 px-1">
          <Simbolo tamanho={30} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[14px] font-semibold text-creme">{nomeLoja}</p>
            <p className="text-[11px] font-medium tracking-[0.12em] text-brasa">FIDELIDADE</p>
          </div>
        </div>
        <div className="flex-1">
          <Links />
        </div>
        {rodape}
      </aside>

      {/* Topo — celular */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-borda bg-forno/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setGaveta(true)}
          aria-label="Abrir menu"
          className="rounded-lg border border-borda p-2 text-fumaca"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <Simbolo tamanho={26} />
        <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">{nomeLoja}</p>
      </header>

      {/* Gaveta — celular */}
      {gaveta && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setGaveta(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="absolute inset-y-0 left-0 flex w-[270px] flex-col border-r border-borda bg-forno p-4">
            <div className="mb-6 flex items-center gap-2.5 px-1">
              <Simbolo tamanho={30} />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[14px] font-semibold text-creme">{nomeLoja}</p>
                <p className="text-[11px] font-medium tracking-[0.12em] text-brasa">FIDELIDADE</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Links aoClicar={() => setGaveta(false)} />
            </div>
            {rodape}
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
