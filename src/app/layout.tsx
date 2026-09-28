import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calculadora de CMV — Axon Fidelidade",
  description:
    "Descubra o custo real de cada prato, quanto sobra no seu bolso e por quanto ele deveria estar sendo vendido. De graça, sem cadastro.",
  openGraph: {
    title: "Quanto sobra de verdade no seu prato?",
    description:
      "Monte a ficha técnica em 2 minutos e veja o custo real, o CMV e o preço ideal. De graça, sem cadastro.",
    type: "website",
    locale: "pt_BR",
    siteName: "Axon Fidelidade"
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#100C09",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
