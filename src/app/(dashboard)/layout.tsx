import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

/**
 * Layout do Dashboard
 *
 * Layout principal para todas as páginas do dashboard.
 * Inclui Sidebar e Header, adaptando o conteúdo conforme o perfil.
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
