import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Configuração otimizada para o Sistema de Gestão de Ambulâncias */
  reactStrictMode: true,

  // Otimizações de compilação
  compiler: {
    // Remover console.log em produção
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental - Otimizações modernas
  experimental: {
    // Otimizar imports de pacotes grandes
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      'date-fns',
      'react-big-calendar',
    ],
  },

  // Imagens otimizadas
  images: {
    domains: [],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },

  // Variáveis de ambiente expostas ao cliente (prefixadas com NEXT_PUBLIC_)
  env: {
    NEXT_PUBLIC_APP_NAME: "Sistema de Gestão de Ambulâncias",
  },
};

export default nextConfig;
