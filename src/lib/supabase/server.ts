import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/** Conexão usada pelas páginas que montam no servidor. */
export function criarClienteServidor() {
  const caixaDeCookies = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return caixaDeCookies.getAll();
      },
      setAll(lista) {
        try {
          lista.forEach(({ name, value, options }) => {
            caixaDeCookies.set(name, value, options);
          });
        } catch {
          // Páginas que só leem não podem gravar cookie.
          // O middleware já cuida de renovar a sessão.
        }
      }
    }
  });
}
