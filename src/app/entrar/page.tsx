"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Marca from "@/components/Marca";
import { Botao, Campo, Erro } from "@/components/ui";
import { criarCliente } from "@/lib/supabase/client";

export default function Entrar() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = criarCliente();

    try {
      if (modo === "criar") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: { data: { nome: nome.trim() } }
        });

        if (error) throw error;

        if (!data.session) {
          setErro(
            "Conta criada, mas o Supabase está pedindo confirmação por e-mail. " +
              "Desligue a opção Confirm email em Authentication e tente entrar."
          );
          setCarregando(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha
        });
        if (error) throw error;
      }

      router.push("/painel");
      router.refresh();
    } catch (falha) {
      setErro(traduzir(falha));
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex justify-center">
          <Marca tamanho={36} />
        </div>

        <div className="cartao p-6">
          <h1 className="font-display text-[22px] font-bold leading-tight">
            {modo === "entrar" ? "Entrar na sua loja" : "Criar sua conta"}
          </h1>
          <p className="mt-1 text-[14px] text-fumaca">
            {modo === "entrar"
              ? "Use o e-mail e a senha que você cadastrou."
              : "Leva menos de um minuto."}
          </p>

          <form onSubmit={enviar} className="mt-5 space-y-4">
            {modo === "criar" && (
              <Campo
                rotulo="Seu nome"
                valor={nome}
                ao={setNome}
                dica="Como você quer ser chamado"
                auto="name"
                obrigatorio
              />
            )}

            <Campo
              rotulo="E-mail"
              valor={email}
              ao={setEmail}
              tipo="email"
              modo="email"
              dica="seu@email.com"
              auto="email"
              obrigatorio
            />

            <Campo
              rotulo="Senha"
              valor={senha}
              ao={setSenha}
              tipo="password"
              dica={modo === "criar" ? "Pelo menos 6 caracteres" : "Sua senha"}
              auto={modo === "criar" ? "new-password" : "current-password"}
              obrigatorio
            />

            <Erro texto={erro} />

            <Botao tipo="submit" carregando={carregando} largura>
              {modo === "entrar" ? "Entrar" : "Criar conta"}
            </Botao>
          </form>

          <div className="mt-5 border-t border-borda pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setModo(modo === "entrar" ? "criar" : "entrar");
                setErro(null);
              }}
              className="text-[14px] text-fumaca transition-colors hover:text-brasa"
            >
              {modo === "entrar"
                ? "Ainda não tenho conta — criar agora"
                : "Já tenho conta — entrar"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[13px] text-cinza">
          <a href="/" className="transition-colors hover:text-brasa">
            ← Voltar para a calculadora de CMV
          </a>
        </p>
      </div>
    </main>
  );
}

/** Deixa o recado do Supabase em português de gente. */
function traduzir(falha: unknown): string {
  const msg = falha instanceof Error ? falha.message : String(falha);
  const m = msg.toLowerCase();

  if (m.includes("invalid login credentials")) return "E-mail ou senha errados.";
  if (m.includes("user already registered")) return "Esse e-mail já tem conta. Escolha Entrar.";
  if (m.includes("password should be at least"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("unable to validate email")) return "Esse e-mail não parece válido.";
  if (m.includes("email not confirmed"))
    return "Essa conta ainda não foi confirmada por e-mail.";
  if (m.includes("failed to fetch") || m.includes("networkerror"))
    return "Não consegui falar com o servidor. Confira sua internet e tente de novo.";

  return msg;
}
