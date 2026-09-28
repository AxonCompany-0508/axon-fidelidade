import Link from "next/link";
import { Titulo } from "@/components/ui";
import { sessaoAtual } from "@/lib/loja";
import { nomeDoTipo } from "@/lib/tipos";

export const dynamic = "force-dynamic";

const SITUACOES = [
  { rotulo: "Clientes da casa", apoio: "pediram nos últimos dias" },
  { rotulo: "Sumindo", apoio: "estão esfriando" },
  { rotulo: "Sumiu", apoio: "hora de chamar de volta" },
  { rotulo: "Aniversariantes", apoio: "fazem aniversário este mês" }
];

export default async function Inicio() {
  const { loja, nomeUsuario, papel } = await sessaoAtual();
  const primeiroNome = nomeUsuario.split(" ")[0] || "bem-vindo";

  return (
    <>
      <Titulo
        texto={`Olá, ${primeiroNome}`}
        apoio={`${loja.nome} · ${nomeDoTipo(loja.tipo)}`}
      />

      {/* Os quatro números que vão comandar a operação */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SITUACOES.map((s) => (
          <div key={s.rotulo} className="cartao p-4">
            <p className="text-[12px] font-medium uppercase tracking-wide text-cinza">
              {s.rotulo}
            </p>
            <p className="mt-1 font-display text-[28px] leading-none text-cinza">0</p>
            <p className="mt-1.5 text-[12px] leading-snug text-cinza">{s.apoio}</p>
          </div>
        ))}
      </div>

      <section className="cartao mt-5 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-folha/15">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 8.5 6.2 11.5 13 4.5"
                stroke="#4CA46E"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-[17px] font-bold">Sua loja está criada</h2>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-fumaca">
              A base está de pé: login funcionando, loja cadastrada e o isolamento de dados
              ativo. Os números aí em cima ficam zerados porque ainda não existe cliente
              cadastrado — o cadastro por QR code é a próxima parte a ser construída.
            </p>
          </div>
        </div>
      </section>

      <section className="cartao mt-5 p-5">
        <h2 className="font-display text-[17px] font-bold">Dados da loja</h2>
        <dl className="mt-4 divide-y divide-borda">
          <Linha rotulo="Nome" valor={loja.nome} />
          <Linha rotulo="Ramo" valor={nomeDoTipo(loja.tipo)} />
          <Linha rotulo="Apelido na internet" valor={`/c/${loja.slug}`} />
          <Linha
            rotulo="WhatsApp"
            valor={loja.whatsapp ? formatarTelefone(loja.whatsapp) : "não informado"}
          />
          <Linha rotulo="Seu papel" valor={rotuloPapel(papel)} />
        </dl>
        <Link href="/painel/conta" className="btn-linha mt-4">
          Alterar dados
        </Link>
      </section>
    </>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-[14px] text-fumaca">{rotulo}</dt>
      <dd className="text-right text-[14.5px] font-medium text-creme">{valor}</dd>
    </div>
  );
}

function rotuloPapel(p: string) {
  if (p === "dono") return "Dono";
  if (p === "gerente") return "Gerente";
  return "Atendente";
}

function formatarTelefone(t: string) {
  const d = t.replace(/\D/g, "");
  const sem55 = d.startsWith("55") ? d.slice(2) : d;
  if (sem55.length === 11) {
    return `(${sem55.slice(0, 2)}) ${sem55.slice(2, 7)}-${sem55.slice(7)}`;
  }
  if (sem55.length === 10) {
    return `(${sem55.slice(0, 2)}) ${sem55.slice(2, 6)}-${sem55.slice(6)}`;
  }
  return t;
}
