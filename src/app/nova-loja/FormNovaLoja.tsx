"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Marca from "@/components/Marca";
import { Aviso, Botao, Campo, Erro } from "@/components/ui";
import { TIPOS } from "@/lib/tipos";
import { criarCliente } from "@/lib/supabase/client";

export default function FormNovaLoja() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("hamburgueria");
  const [whatsapp, setWhatsapp] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro("Escreva o nome da loja.");
      return;
    }

    setCarregando(true);
    const supabase = criarCliente();

    const { error } = await supabase.rpc("criar_loja_e_dono", {
      p_nome: nome.trim(),
      p_tipo: tipo,
      p_whatsapp: whatsapp.replace(/\D/g, "")
    });

    if (error) {
      setErro(error.message);
      setCarregando(false);
      return;
    }

    router.push("/painel");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex justify-center">
          <Marca tamanho={36} />
        </div>

        <form onSubmit={enviar} className="cartao space-y-5 p-6">
          <div>
            <h1 className="font-display text-[22px] font-bold leading-tight">
              Vamos cadastrar sua loja
            </h1>
            <p className="mt-1 text-[14px] text-fumaca">
              Três informações e você já está dentro.
            </p>
          </div>

          <Campo
            rotulo="Nome da loja"
            valor={nome}
            ao={setNome}
            dica="Burger do Zé"
            obrigatorio
          />

          <div>
            <span className="rotulo">Qual é o ramo</span>
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
            auto="tel"
          />

          <Aviso>
            É desse número que vão sair as mensagens para trazer cliente de volta. Pode
            trocar depois em Conta.
          </Aviso>

          <Erro texto={erro} />

          <Botao tipo="submit" carregando={carregando} largura>
            Criar minha loja
          </Botao>
        </form>
      </div>
    </main>
  );
}
