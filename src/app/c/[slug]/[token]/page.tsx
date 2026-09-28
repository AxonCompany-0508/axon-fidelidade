import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Simbolo } from "@/components/Marca";
import { criarClientePublico } from "@/lib/supabase/publico";

export const dynamic = "force-dynamic";

type Cartao = {
  primeiro_nome: string;
  selos: number;
  total_pedidos: number;
  ultimo_pedido_em: string | null;
  loja_nome: string;
  loja_slug: string;
  loja_whatsapp: string | null;
  selos_para_premio: number;
  nome_premio: string;
};

async function buscarCartao(token: string): Promise<Cartao | null> {
  const { data } = await criarClientePublico().rpc("cartao_cliente", { p_token: token });
  const lista = (data as Cartao[]) || [];
  return lista[0] || null;
}

export async function generateMetadata({
  params
}: {
  params: { token: string };
}): Promise<Metadata> {
  const c = await buscarCartao(params.token);
  if (!c) return { title: "Cartão não encontrado" };

  const faltam = Math.max(c.selos_para_premio - c.selos, 0);
  const texto =
    faltam === 0
      ? `Seu prêmio está liberado: ${c.nome_premio}. É só pedir no balcão.`
      : `Faltam ${faltam} ${faltam === 1 ? "pedido" : "pedidos"} para ${c.nome_premio}.`;

  return {
    title: `Seu cartão — ${c.loja_nome}`,
    description: texto,
    openGraph: {
      title: `Seu cartão — ${c.loja_nome}`,
      description: texto,
      type: "website",
      locale: "pt_BR"
    },
    robots: { index: false, follow: false }
  };
}

export default async function PaginaCartao({
  params
}: {
  params: { slug: string; token: string };
}) {
  const c = await buscarCartao(params.token);
  if (!c) notFound();

  const meta = Math.max(c.selos_para_premio, 1);
  const completos = Math.min(c.selos, meta);
  const faltam = Math.max(meta - c.selos, 0);
  const liberado = faltam === 0;

  const zap = c.loja_whatsapp
    ? `https://wa.me/55${c.loja_whatsapp}?text=${encodeURIComponent(
        liberado
          ? `Oi! Meu cartão fidelidade completou. Quero resgatar ${c.nome_premio}.`
          : "Oi! Queria fazer um pedido."
      )}`
    : null;

  return (
    <main className="flex min-h-screen flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-sm flex-1">
        <header className="mb-6 text-center">
          <p className="text-[13px] uppercase tracking-wide text-cinza">{c.loja_nome}</p>
          <h1 className="mt-1 font-display text-[26px] font-extrabold leading-tight">
            Olá, {c.primeiro_nome}
          </h1>
        </header>

        {/* O cartão de selos */}
        <section
          className={`rounded-2xl border p-5 ${
            liberado ? "border-brasa bg-brasa/10" : "border-borda bg-forno"
          }`}
        >
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <p className="text-[13px] font-medium uppercase tracking-wide text-cinza">
              Seus selos
            </p>
            <p className="font-display text-[15px] font-bold text-creme">
              {completos} de {meta}
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2.5">
            {Array.from({ length: meta }).map((_, i) => (
              <div
                key={i}
                className={`flex aspect-square items-center justify-center rounded-full border-2 ${
                  i < completos
                    ? "border-brasa bg-brasa"
                    : "border-dashed border-borda bg-transparent"
                }`}
              >
                {i < completos ? (
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M3 8.5 6.2 11.5 13 4.5"
                      stroke="#100C09"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="text-[12px] font-semibold text-cinza">{i + 1}</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-borda pt-4">
            {liberado ? (
              <>
                <p className="font-display text-[19px] font-bold leading-snug text-brasa">
                  Seu prêmio está liberado
                </p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-fumaca">
                  Peça <span className="font-semibold text-creme">{c.nome_premio}</span> no
                  balcão e mostre esta tela.
                </p>
              </>
            ) : c.selos === 0 ? (
              <>
                <p className="font-display text-[19px] font-bold leading-snug text-creme">
                  Cartão criado
                </p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-fumaca">
                  A cada pedido, é só dizer seu telefone no balcão que você ganha um selo.
                  Completando {meta}, você leva {c.nome_premio}.
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-[19px] font-bold leading-snug text-creme">
                  {faltam === 1 ? "Falta 1 pedido" : `Faltam ${faltam} pedidos`}
                </p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-fumaca">
                  Para você levar {c.nome_premio}.
                </p>
              </>
            )}
          </div>
        </section>

        {zap && (
          <a href={zap} target="_blank" rel="noreferrer" className="btn-brasa mt-4 w-full">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.13c-.25.69-1.44 1.32-1.98 1.37-.54.05-1.04.24-3.5-.73-2.95-1.17-4.8-4.24-4.95-4.44-.14-.2-1.17-1.56-1.17-2.98 0-1.41.74-2.11 1-2.4.26-.29.57-.37.76-.37h.55c.18 0 .42-.07.65.5.24.59.8 2 .87 2.14.07.15.12.32.02.51-.1.2-.15.32-.3.5l-.44.51c-.15.15-.3.31-.13.6.17.3.75 1.24 1.6 2 1.1.98 2.02 1.29 2.31 1.44.29.15.46.12.63-.07.17-.2.73-.85.93-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.74-.18 1.43z" />
            </svg>
            Falar com a {c.loja_nome}
          </a>
        )}

        {c.total_pedidos > 0 && (
          <p className="mt-4 text-center text-[13px] text-cinza">
            {c.total_pedidos} {c.total_pedidos === 1 ? "pedido" : "pedidos"} desde que você
            entrou
          </p>
        )}

        <div className="mt-5 rounded-xl border border-borda bg-grelha px-4 py-3.5">
          <p className="text-[13px] leading-relaxed text-fumaca">
            <span className="font-semibold text-creme">Guarde este link.</span> Ele é o seu
            cartão. No celular, use o botão de compartilhar do navegador e escolha
            &quot;Adicionar à Tela de Início&quot; — aí ele vira um ícone, como um
            aplicativo.
          </p>
        </div>
      </div>

      <footer className="mx-auto mt-8 flex w-full max-w-sm items-center justify-center gap-2 opacity-60">
        <Simbolo tamanho={18} />
        <span className="text-[12px] text-cinza">Axon Fidelidade</span>
      </footer>
    </main>
  );
}
