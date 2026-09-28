import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/** Conexão usada pelas telas que rodam no navegador. */
export function criarCliente() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
