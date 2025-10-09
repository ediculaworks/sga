'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { redirectToDashboard } from '@/lib/utils/redirect';
import { useRouter } from 'next/navigation';

/**
 * Página 404 - Não Encontrado (Dashboard)
 *
 * Exibida quando o usuário tenta acessar uma rota inexistente
 * dentro do dashboard.
 *
 * CORREÇÃO: Não usa ProtectedRoute para evitar loops infinitos
 */
export default function DashboardNotFound() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleGoToDashboard = () => {
    if (user) {
      redirectToDashboard(user.tipo_perfil, router);
    } else {
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Ícone 404 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
            <FileQuestion className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Página não encontrada</h2>
        </div>

        {/* Mensagem */}
        <p className="text-gray-600 mb-8">
          A página que você está procurando não existe ou foi movida para outro local.
        </p>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <Button
            onClick={handleGoToDashboard}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ir para o Dashboard
          </Button>
        </div>

        {/* Link de login (se não estiver autenticado) */}
        {!user && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Não está logado?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
