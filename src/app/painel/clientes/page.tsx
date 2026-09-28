import { Titulo } from "@/components/ui";
import { sessaoAtual } from "@/lib/loja";
import { criarClienteServidor } from "@/lib/supabase/server";
import { formatarTelefone } from "@/lib/telefone";

export const dynamic = "force-dynamic";

type ClienteLinha = {
  id: string;
  nome: string;
  telefone: string;
  selos: number;
  total_pedidos: number;
  ultimo_pedido_em: string | null;
  consentimento_em: string | null;
  criado_em: string;
};

type Situacao = "novo" | "casa" | "sumindo" | "sumiu";

const ETIQUETA: Record<Situacao, { texto: string; cor: string }> = {
  novo: { texto: "Novo", cor: "#16D2A6" },
  casa: { texto: "Cliente da casa", cor: "#4CA46E" },
  sumindo: { texto: "Sumindo", cor: "#F5C441" },
  sumiu: { texto: "Sumiu", cor: "#E04A3F" }
};

function situacaoDe(ultimo: string | null, risco: number, inativo: number): Situacao {
  if (!ultimo) return "novo";
  const dias = Math.floor((Date.now() - new Date(ultimo).getTime()) / 86400000);
  if (dias > inativo) return "sumiu";
  if (dias > risco) return "sumindo";
  return "casa";
}

export default async function PaginaClientes() {
  const { loja } = await sessaoAtual();

  const { data } = await criarClienteServidor()
    .from("clientes")
    .select("id, nome, telefone, selos, total_pedidos, ultimo_pedido_em, consentimento_em, criado_em")
    .eq("loja_id", loja.id)
    .order("criado_em", { ascending: false })
    .limit(300);

  const clientes = (data as ClienteLinha[]) || [];
  const comConsentimento = clientes.filter((c) => c.consentimento_em).length;

  return (
    <>
      <Titulo
        texto="Clientes"
        apoio={
          clientes.length === 0
            ? "Ninguém cadastrado ainda"
            : `${clientes.length} ${clientes.length === 1 ? "pessoa cadastrada" : "pessoas cadastradas"} · ${comConsentimento} aceitaram receber mensagem`
        }
      />

      {clientes.length === 0 ? (
        <section className="cartao p-8 text-center">
          <p className="font-display text-[18px] font-bold">Sua base começa vazia</p>
          <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed text-fumaca">
            Coloque o QR code no balcão. Cada pessoa que escanear e preencher nome e
            WhatsApp aparece aqui na hora.
          </p>
          <a href="/painel/qrcode" className="btn-brasa mt-5">
            Ver meu QR code
          </a>
        </section>
      ) : (
        <ul className="divide-y divide-borda overflow-hidden rounded-2xl border border-borda bg-forno">
          {clientes.map((c) => {
            const s = situacaoDe(c.ultimo_pedido_em, loja.dias_risco, loja.dias_inativo);
            const et = ETIQUETA[s];
            const zap = `https://wa.me/55${c.telefone}`;

            return (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <p className="truncate text-[15px] font-medium text-creme">{c.nome}</p>
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
                      style={{ color: et.cor, backgroundColor: `${et.cor}1A` }}
                    >
                      {et.texto}
                    </span>
                    {!c.consentimento_em && (
                      <span
                        className="rounded-md bg-grelha px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-cinza"
                        title="Não aceitou receber mensagem — fica fora das campanhas"
                      >
                        sem contato
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[13px] text-fumaca">
                    {formatarTelefone(c.telefone)} · {c.selos}{" "}
                    {c.selos === 1 ? "selo" : "selos"}
                  </p>
                </div>

                <a
                  href={zap}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Falar com ${c.nome}`}
                  className="shrink-0 rounded-lg border border-borda p-2.5 text-fumaca transition-colors hover:border-brasa hover:text-brasa"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.13c-.25.69-1.44 1.32-1.98 1.37-.54.05-1.04.24-3.5-.73-2.95-1.17-4.8-4.24-4.95-4.44-.14-.2-1.17-1.56-1.17-2.98 0-1.41.74-2.11 1-2.4.26-.29.57-.37.76-.37h.55c.18 0 .42-.07.65.5.24.59.8 2 .87 2.14.07.15.12.32.02.51-.1.2-.15.32-.3.5l-.44.51c-.15.15-.3.31-.13.6.17.3.75 1.24 1.6 2 1.1.98 2.02 1.29 2.31 1.44.29.15.46.12.63-.07.17-.2.73-.85.93-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.74-.18 1.43z" />
                  </svg>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
