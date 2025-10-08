'use client';

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function ChefeEnfermeirosDashboard() {
  const { user, logout } = useAuthStore();
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard do Chefe dos Enfermeiros</h1>
            <p className="text-gray-600 mt-1">Bem-vindo, {user?.nome_completo}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {user?.nome_completo}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Perfil:</strong> {user?.tipo_perfil}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
