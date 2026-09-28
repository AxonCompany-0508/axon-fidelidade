/**
 * Endereço e chave pública do banco.
 *
 * Estes dois valores são públicos por natureza: eles viajam dentro
 * do site, qualquer pessoa consegue ver no navegador. Isso é normal
 * e não é falha de segurança — quem protege os dados é a regra de
 * acesso que roda dentro do banco (o "Row Level Security").
 *
 * A chave service_role NUNCA entra aqui. Ela dá acesso total e
 * precisa ficar só no painel do Supabase.
 */
export const SUPABASE_URL = "https://yeziacunsnvelzewualv.supabase.co";

export const SUPABASE_KEY = "sb_publishable_nPRkoQ4b8kYY4Ohv16-u-w_bULSbaNt";
