import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: "Sistema de Gestão de Ambulâncias",
  description: "Sistema completo para gestão de ambulâncias, motoristas, equipes e ocorrências",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
