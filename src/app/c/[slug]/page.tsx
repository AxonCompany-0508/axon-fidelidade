import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FormCadastro from "./FormCadastro";
import { Simbolo } from "@/components/Marca";
import { criarClientePublico } from "@/lib/supabase/publico";

export const dynamic = "force-dynamic";

type LojaPublica = {
  nome: string;
  tipo: string;
  slug: string;
  selos_para_premio: number;
  nome_premio: string;
};

async function buscarLoja(slug: string): Promise<LojaPublica | null> {
  const { data } = await criarClientePublico().rpc("loja_publica", { p_slug: slug });
  const lista = (data as LojaPublica[]) || [];
  return lista[0] || null;
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const loja = await buscarLoja(params.slug);
  if (!loja) return { title: "Loja não encontrada" };

  const titulo = `Cartão fidelidade — ${loja.nome}`;
  const texto = `A cada ${loja.selos_para_premio} pedidos, ${loja.nome_premio}. Cadastre-se em 30 segundos, sem app e sem cartãozinho pra perder.`;

  return {
    title: titulo,
    description: texto,
    openGraph: { title: titulo, description: texto, type: "website", locale: "pt_BR" }
  };
}

export default async function PaginaCadastro({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { o?: string };
}) {
  const loja = await buscarLoja(params.slug);
  if (!loja) notFound();

  return (
    <main className="flex min-h-screen flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-sm flex-1">
        <header className="mb-6 text-center">
          <p className="font-display text-[26px] font-extrabold leading-tight text-creme">
            {loja.nome}
          </p>
          <p className="mt-1.5 text-[14px] text-fumaca">Cartão fidelidade digital</p>
        </header>

        {/* A oferta, em uma frase */}
        <div className="mb-6 rounded-2xl border border-brasa/30 bg-brasa/10 px-5 py-5 text-center">
          <p className="font-display text-[19px] font-bold leading-snug text-creme">
            A cada {loja.selos_para_premio} pedidos,
            <br />
            <span className="text-brasa">{loja.nome_premio}</span>
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-fumaca">
            Sem aplicativo para baixar e sem cartãozinho para perder. Fica tudo no seu
            WhatsApp.
          </p>
        </div>

        <FormCadastro
          slug={loja.slug}
          origem={searchParams.o || null}
          selosParaPremio={loja.selos_para_premio}
        />
      </div>

      <footer className="mx-auto mt-8 flex w-full max-w-sm items-center justify-center gap-2 opacity-60">
        <Simbolo tamanho={18} />
        <span className="text-[12px] text-cinza">Axon Fidelidade</span>
      </footer>
    </main>
  );
}
