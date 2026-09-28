/** Ramos de loja. Fica separado porque as telas do navegador também usam. */

export type Loja = {
  id: string;
  nome: string;
  slug: string;
  tipo: string;
  whatsapp: string | null;
  plano: string;
  status: string;
  dias_risco: number;
  dias_inativo: number;
  cooldown_dias: number;
  selos_para_premio: number;
  nome_premio: string;
  ticket_medio: number | null;
  link_avaliacao: string | null;
  avaliacao_apos_pedidos: number;
  mensagem_avaliacao: string;
};

export const TIPOS: { id: string; nome: string }[] = [
  { id: "hamburgueria", nome: "Hamburgueria" },
  { id: "pizzaria", nome: "Pizzaria" },
  { id: "delivery", nome: "Delivery / marmitaria" },
  { id: "bar", nome: "Bar / petiscaria" },
  { id: "doceria", nome: "Açaí / sorveteria / doceria" },
  { id: "casa_de_carnes", nome: "Casa de carnes / açougue" },
  { id: "outro", nome: "Outro" }
];

export function nomeDoTipo(id: string): string {
  return TIPOS.find((t) => t.id === id)?.nome || "Loja";
}
