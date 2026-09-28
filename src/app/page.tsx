import Calculadora from "@/components/Calculadora";
import Marca, { MarcaLarga } from "@/components/Marca";
import { ASSINATURA } from "@/lib/config";

export default function Pagina() {
  return (
    <main className="min-h-screen">
      {/* Topo */}
      <header className="border-b border-borda">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <MarcaLarga />
          <div className="flex items-center gap-4">
            <span className="hidden text-[13px] text-cinza lg:block">
              Grátis · sem cadastro
            </span>
            <a
              href="/entrar"
              className="rounded-lg border border-borda px-3 py-1.5 text-[13px] font-medium text-fumaca transition-colors hover:border-brasa hover:text-brasa"
            >
              Entrar
            </a>
          </div>
        </div>
      </header>

      {/* Chamada */}
      <section className="border-b border-borda bg-gradient-to-b from-brasa/[0.07] to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brasa/30 bg-brasa/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-brasa-claro">
            Calculadora de CMV
          </p>
          <h1 className="max-w-3xl font-display text-[32px] font-extrabold leading-[1.08] sm:text-[46px]">
            Quanto sobra de verdade em cada prato que você vende?
          </h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-fumaca sm:text-[17px]">
            A maioria dos donos sabe o preço da carne, mas não sabe o custo do prato pronto — com
            embalagem, com desperdício, com a comissão do aplicativo. Monte a ficha técnica aqui em
            dois minutos e veja o número.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-fumaca">
            {[
              "Preço do quilo, do litro ou do pacote",
              "Desconta a comissão do app",
              "Mostra o preço ideal para o seu ramo"
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3 8.5L6.2 11.5L13 4.5"
                    stroke="#FF7A18"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Calculadora */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Calculadora />
      </div>

      {/* Rodapé */}
      <footer className="border-t border-borda">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Marca tamanho={26} />
          <p className="max-w-md text-[12.5px] leading-relaxed text-cinza">
            As fichas que você salva ficam guardadas só no seu próprio aparelho. Não pedimos
            cadastro e não enviamos nada para nenhum servidor. Uma ferramenta gratuita da{" "}
            {ASSINATURA}.
          </p>
        </div>
      </footer>
    </main>
  );
}
