import { Header } from "@/components/shared/Header";

/**
 * Layout para o dashboard principal
 *
 * Este layout inclui o cabeçalho e será usado para todas
 * as páginas do dashboard após autenticação.
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
