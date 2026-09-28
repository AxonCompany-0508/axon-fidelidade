import type { Config } from "tailwindcss";

/**
 * Paleta do Axon Fidelidade.
 *
 * Nada aqui vem do CRM de corretores. Lá o tema é verde escuro;
 * aqui é brasa: preto de carvão, laranja de fogo e creme.
 * Os nomes são em português e do ramo, para ninguém se perder.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        carvao: "#100C09", // fundo da página
        forno: "#1A1411", // cartões e caixas
        grelha: "#241C17", // caixa dentro de caixa
        borda: "#362B24", // linhas e contornos
        brasa: {
          DEFAULT: "#FF7A18", // cor principal da marca
          claro: "#FFA04D",
          escuro: "#D95F0A"
        },
        creme: "#FBF6EF", // texto principal
        fumaca: "#A79A8E", // texto secundário
        cinza: "#6D6158", // texto apagado
        tomate: "#E04A3F", // erro e alerta
        folha: "#4CA46E", // tudo certo
        mel: "#F5C441" // atenção
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"]
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;
