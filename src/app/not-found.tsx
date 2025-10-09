'use client';

import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Página 404 Global - Não Encontrado
 *
 * Exibida quando o usuário tenta acessar uma rota inexistente
 * fora do dashboard.
 */
export default function GlobalNotFound() {
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
          <Link href="/login">
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Ir para o Login
            </Button>
          </Link>
        </div>

        {/* Informações de contato */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Se você acredita que isso é um erro, entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
