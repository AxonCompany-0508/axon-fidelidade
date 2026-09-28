"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Erro } from "@/components/ui";
import {
  MESES,
  formatarEnquantoDigita,
  montarAniversario,
  soDigitos,
  telefoneValido
} from "@/lib/telefone";
import { criarCliente } from "@/lib/supabase/client";

export default function FormCadastro({
  slug,
  origem,
  selosParaPremio
}: {
  slug: string;
  origem: string | null;
  selosParaPremio: number;
}) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [consente, setConsente] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro("Escreva seu nome.");
      return;
    }
    if (!telefoneValido(telefone)) {
      setErro("Confira o número do WhatsApp. Precisa ter o DDD.");
      return;
    }

    setCarregando(true);

    const { data, error } = await criarCliente().rpc("cadastrar_cliente", {
      p_slug: slug,
      p_nome: nome.trim(),
      p_telefone: soDigitos(telefone),
      p_aniversario: montarAniversario(dia, mes),
      p_consente: consente,
      p_origem_token: origem
    });

    if (error || !data) {
      setErro(error?.message || "Não consegui concluir o cadastro. Tente de novo.");
      setCarregando(false);
      return;
    }

    router.push(`/c/${slug}/${data as string}`);
  }

  return (
    <form onSubmit={enviar} className="cartao space-y-4 p-5">
      <label className="block">
        <span className="rotulo">Seu nome</span>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como te chamam"
          autoComplete="name"
          className="campo"
          required
        />
      </label>

      <label className="block">
        <span className="rotulo">Seu WhatsApp</span>
        <input
          value={telefone}
          onChange={(e) => setTelefone(formatarEnquantoDigita(e.target.value))}
          placeholder="(14) 99999-0000"
          inputMode="numeric"
          autoComplete="tel"
          className="campo"
          required
        />
      </label>

      <div>
        <span className="rotulo">
          Seu aniversário{" "}
          <span className="font-normal text-cinza">— opcional, rende um mimo</span>
        </span>
        <div className="grid grid-cols-[88px_1fr] gap-2">
          <input
            value={dia}
            onChange={(e) => setDia(e.target.value.replace(/\D/g, "").slice(0, 2))}
            placeholder="Dia"
            inputMode="numeric"
            className="campo"
          />
          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="campo appearance-none"
          >
            <option value="">Mês</option>
            {MESES.map((m, i) => (
              <option key={m} value={String(i + 1)}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-borda bg-grelha p-3.5">
        <input
          type="checkbox"
          checked={consente}
          onChange={(e) => setConsente(e.target.checked)}
          className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-[#FF7A18]"
          style={{ width: 18, height: 18 }}
        />
        <span className="text-[13.5px] leading-relaxed text-fumaca">
          Quero receber ofertas e novidades no meu WhatsApp. Posso pedir para sair a
          qualquer momento.
        </span>
      </label>

      <Erro texto={erro} />

      <button type="submit" disabled={carregando} className="btn-brasa w-full">
        {carregando ? "Criando..." : "Criar meu cartão"}
      </button>

      <p className="text-center text-[12px] leading-relaxed text-cinza">
        Seus dados ficam só com a loja. Sem marcar a caixa acima você acumula selos do
        mesmo jeito — só não recebe mensagem.
      </p>

      <p className="border-t border-borda pt-3 text-center text-[12.5px] text-cinza">
        Já tem cartão? Cadastre o mesmo número que ele volta, com os{" "}
        {selosParaPremio > 0 ? "selos" : "pontos"} que você já tinha.
      </p>
    </form>
  );
}
