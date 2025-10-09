'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OcorrenciasTable } from '@/components/ocorrencias/OcorrenciasTable';
import { OcorrenciaDetalhesModal } from '@/components/ocorrencias/OcorrenciaDetalhesModal';
import type { Ocorrencia } from '@/types';
import { PerfilUsuario } from '@/types';

/**
 * Página de Banco de Dados de Ocorrências
 * Exclusiva para Chefe dos Médicos
 *
 * Funcionalidades:
 * - Tabela com todas as ocorrências do sistema
 * - Filtros avançados (status, tipo, ambulância, busca)
 * - Ordenação: ocorrências ativas primeiro, depois por data
 * - Paginação (20 itens por página)
 * - Destaque visual para ocorrências ativas e confirmadas
 * - Modal de detalhes ao clicar em "Ver Detalhes"
 */
export default function OcorrenciasPage() {
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] =
    useState<Ocorrencia | null>(null);

  return (
    <ProtectedRoute perfisPermitidos={[PerfilUsuario.CHEFE_MEDICOS]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Banco de Dados de Ocorrências
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Visualize e gerencie todas as ocorrências do sistema
          </p>
        </div>

        {/* Info card */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="space-y-1 text-sm text-blue-800">
              <p className="font-medium">Sobre a ordenação</p>
              <p>
                As ocorrências <strong>em andamento</strong> aparecem no topo com fundo
                verde claro, seguidas pelas <strong>confirmadas</strong> com fundo azul
                claro. As demais aparecem em ordem decrescente de data.
              </p>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <OcorrenciasTable
          onVerDetalhes={(ocorrencia) => setOcorrenciaSelecionada(ocorrencia)}
        />

        {/* Modal de Detalhes */}
        {ocorrenciaSelecionada && (
          <OcorrenciaDetalhesModal
            ocorrenciaId={ocorrenciaSelecionada.id}
            isOpen={!!ocorrenciaSelecionada}
            onClose={() => setOcorrenciaSelecionada(null)}
            perfil="MEDICO"
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
