'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/**
 * Dashboard do Médico (Placeholder)
 */

function MedicoDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard do Médico</h1>
            <p className="text-gray-600 mt-1">Bem-vindo, {user?.nome_completo}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ocorrências Atendidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500">Esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>A Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">R$ 0,00</p>
              <p className="text-sm text-gray-500">Pagamentos pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Remoções</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">0</p>
              <p className="text-sm text-gray-500">Este mês</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Dados do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {user?.nome_completo}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>CPF:</strong> {user?.cpf}</p>
              <p><strong>Perfil:</strong> {user?.tipo_perfil}</p>
              <p><strong>Status:</strong> {user?.ativo ? 'Ativo' : 'Inativo'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function MedicoDashboard() {
  return (
    <ProtectedRoute allowedProfiles={['MEDICO']}>
      <MedicoDashboardContent />
    </ProtectedRoute>
  );
}
