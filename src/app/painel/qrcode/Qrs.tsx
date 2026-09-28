"use client";

import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Aviso, Erro } from "@/components/ui";
import { criarCliente } from "@/lib/supabase/client";
import type { Origem } from "./page";

export default function Qrs({
  lojaId,
  slug,
  nomeLoja,
  selosParaPremio,
  nomePremio,
  origens
}: {
  lojaId: string;
  slug: string;
  nomeLoja: string;
  selosParaPremio: number;
  nomePremio: string;
  origens: Origem[];
}) {
  const router = useRouter();
  const [base, setBase] = useState("");
  const [imagens, setImagens] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState<string | null>(null);
  const [novo, setNovo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [cartaz, setCartaz] = useState<Origem | null>(null);

  const linkDe = useCallback(
    (o: Origem) => (base ? `${base}/c/${slug}?o=${o.token}` : ""),
    [base, slug]
  );

  useEffect(() => {
    setBase(window.location.origin);
  }, []);

  // Desenha um QR para cada origem.
  useEffect(() => {
    if (!base) return;
    let vivo = true;

    Promise.all(
      origens.map(async (o) => {
        const url = await QRCode.toDataURL(`${base}/c/${slug}?o=${o.token}`, {
          width: 900,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#0A0A0A", light: "#FFFFFF" }
        });
        return [o.id, url] as const;
      })
    ).then((pares) => {
      if (vivo) setImagens(Object.fromEntries(pares));
    });

    return () => {
      vivo = false;
    };
  }, [base, slug, origens]);

  async function copiar(o: Origem) {
    try {
      await navigator.clipboard.writeText(linkDe(o));
      setCopiado(o.id);
      window.setTimeout(() => setCopiado(null), 2000);
    } catch {
      setErro("Seu navegador não deixou copiar. Selecione o link e copie à mão.");
    }
  }

  function baixar(o: Origem) {
    const img = imagens[o.id];
    if (!img) return;
    const a = document.createElement("a");
    a.href = img;
    a.download = `qrcode-${slug}-${o.nome.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }

  function imprimir(o: Origem) {
    setCartaz(o);
    window.setTimeout(() => window.print(), 250);
  }

  async function criarOrigem(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!novo.trim()) return;

    setSalvando(true);
    const { error } = await criarCliente()
      .from("origens")
      .insert({ loja_id: lojaId, nome: novo.trim() });
    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }
    setNovo("");
    router.refresh();
  }

  async function apagar(o: Origem) {
    if (origens.length <= 1) {
      setErro("Deixe pelo menos um QR ativo.");
      return;
    }
    const { error } = await criarCliente().from("origens").delete().eq("id", o.id);
    if (error) {
      setErro(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="nao-imprime space-y-5">
        <Aviso>
          Cada QR marca de onde o cliente veio. Um no balcão, outro colado na embalagem do
          delivery, outro no Instagram — e depois você vê qual trouxe mais gente. Se não
          quiser complicar, use só o do balcão.
        </Aviso>

        <Erro texto={erro} />

        {origens.map((o) => (
          <section key={o.id} className="cartao p-5">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="mx-auto shrink-0 sm:mx-0">
                {imagens[o.id] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imagens[o.id]}
                    alt={`QR code ${o.nome}`}
                    className="h-[168px] w-[168px] rounded-xl bg-white p-2"
                  />
                ) : (
                  <div className="h-[168px] w-[168px] animate-pulse rounded-xl bg-grelha" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-[18px] font-bold">{o.nome}</h2>
                    <p className="mt-0.5 text-[13px] text-cinza">
                      Quem escanear aqui entra marcado como &quot;{o.nome}&quot;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => apagar(o)}
                    aria-label={`Apagar ${o.nome}`}
                    className="rounded-lg border border-borda p-2 text-cinza transition-colors hover:border-tomate hover:text-tomate"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M4 4l8 8M12 4l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <p className="mt-3 overflow-x-auto whitespace-nowrap rounded-lg border border-borda bg-grelha px-3 py-2 text-[12.5px] text-fumaca">
                  {linkDe(o) || "..."}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => copiar(o)} className="btn-linha !py-2">
                    {copiado === o.id ? "Link copiado" : "Copiar link"}
                  </button>
                  <button type="button" onClick={() => baixar(o)} className="btn-linha !py-2">
                    Baixar PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => imprimir(o)}
                    className="btn-brasa !py-2"
                  >
                    Imprimir cartaz
                  </button>
                </div>
              </div>
            </div>
          </section>
        ))}

        <form onSubmit={criarOrigem} className="cartao p-5">
          <h2 className="font-display text-[17px] font-bold">Criar outro QR</h2>
          <p className="mt-1 text-[14px] text-fumaca">
            Exemplos: Embalagem, Delivery, Instagram, Balcão da rua 2.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              value={novo}
              onChange={(e) => setNovo(e.target.value)}
              placeholder="Nome do ponto"
              className="campo flex-1"
            />
            <button type="submit" disabled={salvando} className="btn-brasa shrink-0">
              Criar
            </button>
          </div>
        </form>

        <section className="cartao p-5">
          <h2 className="font-display text-[17px] font-bold">Testando agora</h2>
          <ol className="mt-3 space-y-2 text-[14.5px] leading-relaxed text-fumaca">
            <li>1. Pegue outro celular, ou peça pra alguém do lado.</li>
            <li>2. Aponte a câmera para o QR aí de cima.</li>
            <li>3. Preencha nome e WhatsApp.</li>
            <li>
              4. O cartão de selos aparece na hora — e o cadastro cai na aba{" "}
              <strong className="text-creme">Clientes</strong>.
            </li>
          </ol>
        </section>
      </div>

      {/* Cartaz de mesa. Fica escondido até a hora de imprimir. */}
      {cartaz && (
        <div className="so-imprime" style={{ textAlign: "center", padding: "40px 30px" }}>
          <p
            style={{
              fontSize: 15,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#555",
              margin: 0
            }}
          >
            {nomeLoja}
          </p>
          <h1
            style={{
              fontSize: 46,
              lineHeight: 1.05,
              fontWeight: 800,
              margin: "14px 0 0",
              color: "#000"
            }}
          >
            Aponte a câmera
            <br />e ganhe
          </h1>
          <p style={{ fontSize: 22, margin: "18px 0 0", color: "#000" }}>
            A cada <strong>{selosParaPremio} pedidos</strong>,<br />
            <strong>{nomePremio}</strong>
          </p>

          {imagens[cartaz.id] && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imagens[cartaz.id]}
              alt=""
              style={{ width: 330, height: 330, margin: "26px auto 0", display: "block" }}
            />
          )}

          <p style={{ fontSize: 17, margin: "22px 0 0", color: "#333" }}>
            Sem aplicativo. Sem cartãozinho pra perder.
          </p>
          <p style={{ fontSize: 13, margin: "8px 0 0", color: "#777" }}>
            Leva 30 segundos: só o nome e o WhatsApp.
          </p>
        </div>
      )}
    </>
  );
}
