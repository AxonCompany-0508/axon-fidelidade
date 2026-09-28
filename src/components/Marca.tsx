/**
 * Marca Axon.
 *
 * O símbolo é o mesmo da marca — três nós ligados, o sinal que
 * se espalha. Foi refeito em vetor para ficar nítido em qualquer
 * tamanho e para poder mudar de cor conforme o fundo.
 *
 * cor="mint"  -> verde da Axon. Usar em tela de entrar, rodapé,
 *                página do cliente final. É a assinatura da casa.
 * cor="creme" -> monocromático. Usar dentro do painel, para não
 *                brigar com o laranja do produto.
 */

const MINT = "#16D2A6";

export function Simbolo({
  tamanho = 32,
  cor = "mint"
}: {
  tamanho?: number;
  cor?: "mint" | "creme" | "carvao";
}) {
  const c = cor === "mint" ? MINT : cor === "creme" ? "#FBF6EF" : "#100C09";

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      {/* as duas ligações */}
      <path
        d="M11.7 14.4 19.6 10.1M11.7 17.6 19.6 21.9"
        stroke={c}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      {/* nó de origem, cheio */}
      <circle cx="8.6" cy="16" r="3.4" fill={c} />
      {/* nós de destino, vazados */}
      <circle cx="22.6" cy="8.6" r="2.9" stroke={c} strokeWidth="1.9" />
      <circle cx="22.6" cy="23.4" r="2.9" stroke={c} strokeWidth="1.9" />
    </svg>
  );
}

/** Símbolo dentro do quadradinho escuro, como no perfil do Instagram. */
export function Selo({ tamanho = 40 }: { tamanho?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[22%] bg-[#010715]"
      style={{ width: tamanho, height: tamanho }}
    >
      <Simbolo tamanho={Math.round(tamanho * 0.74)} />
    </span>
  );
}

/** Marca completa: símbolo + nome + linha de apoio. */
export default function Marca({
  tamanho = 30,
  cor = "mint",
  apoio = true
}: {
  tamanho?: number;
  cor?: "mint" | "creme";
  apoio?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Simbolo tamanho={tamanho} cor={cor} />
      <div className="leading-none">
        <span className="block font-display text-[17px] font-extrabold tracking-tight text-creme">
          Axon
        </span>
        {apoio && (
          <span className="mt-0.5 block text-[10.5px] font-semibold tracking-[0.16em] text-brasa">
            FIDELIDADE
          </span>
        )}
      </div>
    </div>
  );
}

/** Marca deitada, para o topo de página pública. */
export function MarcaLarga() {
  return (
    <div className="flex items-center gap-3">
      <Simbolo tamanho={34} />
      <div>
        <p className="font-display text-[19px] font-extrabold leading-none tracking-tight text-creme">
          Axon <span className="text-brasa">Fidelidade</span>
        </p>
        <p className="mt-1 hidden text-[12px] leading-none text-fumaca sm:block">
          Faz o cliente voltar — e avisa quando ele some.
        </p>
      </div>
    </div>
  );
}
