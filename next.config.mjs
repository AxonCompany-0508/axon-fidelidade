/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A fonte é carregada pelo navegador, não durante o build.
  // Assim o deploy na Vercel nunca depende do Google estar respondendo.
  optimizeFonts: false
};

export default nextConfig;
