"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Aviso, Botao, Campo, Erro } from "@/components/ui";
import { TIPOS, type Loja } from "@/lib/tipos";
import { criarCliente } from "@/lib/supabase/client";

export default function FormConta({
  loja,
  podeEditar,
  email
}: {
  loja: Loja;
  podeEditar: boolean;
  email: string;
}) {
  const router = useRouter();
  const [nome, setNome] = useState(loja.nome);
  const [tipo, setTipo] = useState(loja.tipo);
  const [whatsapp, setWhatsapp] = useState(loja.whatsapp || "");
  const [risco, setRisco] = useState(String(loja.dias_risco));
  const [inativo, setInativo] = useState(String(loja.dias_inativo));
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvo(false);

    const nRisco = Number(risco) || 30;
    const nInativo = Number(inativo) || 60;

    if (nInativo <= nRisco) {
      setErro('O prazo de "sumiu" precisa ser maior que o de "sumindo".');
      return;
    }

    setCarregando(true);

    const { error } = await criarCliente()
      .from("lojas")
      .update({
        nome: nome.trim(),
        tipo,
        whatsapp: whatsapp.replace(/\D/g, "") || null,
        dias_risco: nRisco,
        dias_inativo: nInativo
      })
      .eq("id", loja.id);

    setCarregando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    setSalvo(true);
    router.refresh();
    window.setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <form onSubmit={salvar} className="space-y-5">
      <section className="cartao space-y-5 p-5">
        <h2 className="font-display text-[17px] font-bold">A loja</h2>

        <Campo rotulo="Nome" valor={nome} ao={setNome} obrigatorio />

        <div>
          <span className="rotulo">Ramo</span>
          <div className="flex flex-wrap gap-2">
            {TIPOS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(t.id)}
                className={`rounded-xl px-3 py-2 text-[14px] font-medium transition-colors ${
                  tipo === t.id
                    ? "bg-brasa text-carvao"
                    : "border border-borda text-fumaca hover:border-brasa/50 hover:text-creme"
                }`}
              >
                {t.nome}
              </button>
            ))}
          </div>
        </div>

        <Campo
          rotulo="WhatsApp da loja"
          valor={whatsapp}
          ao={setWhatsapp}
          modo="tel"
          dica="(14) 99999-0000"
        />

        <div>
          <span className="rotulo">Apelido na internet</span>
          <p className="rounded-xl border border-borda bg-grelha px-3 py-2.5 text-[15px] text-fumaca">
            /c/{loja.slug}
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-cinza">
            Esse endereço vai estar impresso no QR code da loja. Por isso ele não muda.
          </p>
        </div>
      </section>

      <section className="cartao space-y-5 p-5">
        <div>
          <h2 className="font-display text-[17px] font-bold">Quando o cliente está sumindo</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-fumaca">
            Cada ramo tem um ritmo. Quem vende marmita vê o cliente toda semana; casa de
            carnes, a cada quinze dias. Ajuste para o seu.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            rotulo='Vira "sumindo" depois de (dias)'
            valor={risco}
            ao={setRisco}
            modo="numeric"
          />
          <Campo
            rotulo='Vira "sumiu" depois de (dias)'
            valor={inativo}
            ao={setInativo}
            modo="numeric"
          />
        </div>

        <Aviso>
          Com {risco || "30"} e {inativo || "60"} dias: quem não pede há mais de{" "}
          {risco || "30"} dias aparece como <strong className="text-mel">sumindo</strong>, e
          passando de {inativo || "60"} dias entra na fila de{" "}
          <strong className="text-tomate">chamar de volta</strong>.
        </Aviso>
      </section>

      <Erro texto={erro} />

      {podeEditar ? (
        <div className="flex items-center gap-3">
          <Botao tipo="submit" carregando={carregando}>
            Salvar alterações
          </Botao>
          {salvo && <span className="text-[14px] text-folha">Salvo.</span>}
        </div>
      ) : (
        <Aviso>Só o dono ou o gerente da loja pode alterar estes dados.</Aviso>
      )}

      <section className="cartao p-5">
        <h2 className="font-display text-[17px] font-bold">Seu acesso</h2>
        <p className="mt-2 text-[14.5px] text-fumaca">
          Você está logado como <span className="font-medium text-creme">{email}</span>.
        </p>
      </section>
    </form>
  );
}
