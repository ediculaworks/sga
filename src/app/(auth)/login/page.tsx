'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * Página de Login
 *
 * Interface de autenticação do Sistema de Gestão de Ambulâncias.
 * Permite login com email e senha, com validação e feedback visual.
 *
 * CORREÇÕES v0.18.11:
 * - Corrigido hydration mismatch do Zustand persist
 * - Estado local de loading para evitar race conditions
 *
 * CORREÇÕES v0.18.12:
 * - Redirecionamento via window.location.href para garantir propagação da sessão no Vercel
 * - router.push() não esperava sessão propagar, causando loop de login
 */

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  // Estado local para evitar hydration mismatch
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Aguardar hydration do Zustand
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  /**
   * Valida os campos do formulário
   */
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Validar email
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar senha
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Lida com o submit do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos
    if (!validateForm()) {
      return;
    }

    // Limpar erros anteriores
    setErrors({});
    setIsSubmitting(true);

    try {
      console.log('[LOGIN] Iniciando login...');
      const result = await login(email, password);

      if (result.success) {
        console.log('[LOGIN] Login bem-sucedido');
        toast.success('Login realizado com sucesso!');

        // Buscar o usuário do store para pegar o perfil
        const { user } = useAuthStore.getState();

        if (user) {
          const dashboardRoutes: Record<string, string> = {
            MEDICO: '/medico',
            ENFERMEIRO: '/enfermeiro',
            MOTORISTA: '/motorista',
            CHEFE_MEDICOS: '/chefe-medicos',
            CHEFE_ENFERMEIROS: '/chefe-enfermeiros',
            CHEFE_AMBULANCIAS: '/chefe-ambulancias',
          };

          const route = dashboardRoutes[user.tipo_perfil] || '/';

          console.log('[LOGIN] Redirecionando para:', route);

          // CORREÇÃO v0.18.12: Usar window.location.href no Vercel
          // router.push() não espera a sessão propagar no middleware
          // window.location.href força reload completo com sessão atualizada
          window.location.href = route;
        } else {
          console.error('[LOGIN] Usuário não encontrado no store após login');
          toast.error('Erro ao obter dados do usuário');
          setIsSubmitting(false);
        }
      } else {
        console.error('[LOGIN] Erro no login:', result.error);
        toast.error(result.error || 'Erro ao fazer login');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('[LOGIN] Exceção durante login:', error);
      toast.error('Erro inesperado ao fazer login');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sistema de Gestão de Ambulâncias
          </CardTitle>
          <CardDescription className="text-gray-600">
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
                disabled={!isHydrated || isSubmitting}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-red-500 focus:ring-red-500' : ''}
                disabled={!isHydrated || isSubmitting}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5"
              disabled={!isHydrated || isSubmitting}
            >
              {!isHydrated ? (
                'Carregando...'
              ) : isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Link de Suporte */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Problemas para acessar?{' '}
              <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                Entre em contato com o suporte
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
