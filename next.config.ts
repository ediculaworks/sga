import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Configuração otimizada para o Sistema de Gestão de Ambulâncias */
  reactStrictMode: true,

  // Imagens otimizadas
  images: {
    domains: [],
    formats: ["image/avif", "image/webp"],
  },

  // Variáveis de ambiente expostas ao cliente (prefixadas com NEXT_PUBLIC_)
  env: {
    NEXT_PUBLIC_APP_NAME: "Sistema de Gestão de Ambulâncias",
  },
};

export default nextConfig;
