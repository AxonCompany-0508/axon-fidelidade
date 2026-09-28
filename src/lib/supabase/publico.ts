import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/**
 * Conexão sem login, para as páginas que o cliente final abre.
 *
 * Ela só alcança as três funções públicas (loja_publica,
 * cadastrar_cliente e cartao_cliente). As tabelas continuam
 * fechadas.
 */
export function criarClientePublico() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
