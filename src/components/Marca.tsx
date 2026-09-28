/**
 * Marca do produto. Nada a ver com o símbolo do CRM:
 * aqui é uma chama, a ideia é fogo, brasa, cozinha.
 */
export function Simbolo({ tamanho = 32 }: { tamanho?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect width="32" height="32" rx="9" fill="#1A1411" />
      <rect width="32" height="32" rx="9" fill="url(#brasaFundo)" fillOpacity="0.14" />
      <path
        d="M16 4.2c4.3 4.6 7 7.5 7 12 0 4.2-3.1 7.6-7 7.6s-7-3.4-7-7.6c0-2.8 1.4-4.8 3.3-7.1.6 1.5 1.5 2.5 2.5 3-.3-3.1.4-5.6 1.2-7.9Z"
        fill="url(#brasaChama)"
      />
      <path
        d="M16 13.4c1.9 2.1 3 3.4 3 5.4 0 1.9-1.3 3.4-3 3.4s-3-1.5-3-3.4c0-1.7 1.1-3 3-5.4Z"
        fill="#FFE2B8"
      />
      <defs>
        <linearGradient id="brasaChama" x1="16" y1="4.2" x2="16" y2="23.8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB05C" />
          <stop offset="0.55" stopColor="#FF7A18" />
          <stop offset="1" stopColor="#D95F0A" />
        </linearGradient>
        <linearGradient id="brasaFundo" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7A18" />
          <stop offset="1" stopColor="#FF7A18" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Marca({ tamanho = 30 }: { tamanho?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <Simbolo tamanho={tamanho} />
      <div className="leading-none">
        <span className="block font-display text-[15px] font-extrabold tracking-tight text-creme">
          AXON
        </span>
        <span className="block text-[11px] font-medium tracking-[0.14em] text-brasa">
          FIDELIDADE
        </span>
      </div>
    </div>
  );
}
