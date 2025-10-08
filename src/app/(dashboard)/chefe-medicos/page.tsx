'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChefeMedicosStats } from '@/hooks/useChefeMedicosStats';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Ambulance,
  Users,
  Activity,
  Clock,
  Plus,
  AlertTriangle,
  AlertCircle,
  Wrench,
  CreditCard,
  Package,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TipoPerfil } from '@/types';

/**
 * Dashboard do Chefe dos Médicos - FASE 7.1
 *
 * Features:
 * - 4 cards de estatísticas (ambulâncias, profissionais, ocorrências, tempo médio)
 * - Seção de avisos (manutenção, CNH, estoque baixo)
 * - Botão destacado "Criar Nova Ocorrência"
 */

export default function ChefeMedicosDashboard() {
  const router = useRouter();
  const { stats, avisos, isLoading } = useChefeMedicosStats();
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('hoje');

  const handleCriarOcorrencia = () => {
    router.push('/chefe-medicos/central-despacho');
  };

  // Função para formatar tempo em horas e minutos
  const formatarTempo = (minutos: number | null) => {
    if (minutos === null) return 'N/A';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas === 0) return `${mins}min`;
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}min`;
  };

  // Função para obter ícone do aviso
  const getAvisoIcon = (tipo: string) => {
    switch (tipo) {
      case 'manutencao':
        return <Wrench className="w-5 h-5" />;
      case 'cnh_vencida':
      case 'cnh_vencendo':
        return <CreditCard className="w-5 h-5" />;
      case 'estoque_baixo':
        return <Package className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  // Função para obter cor do aviso
  const getAvisoColor = (severidade: string) => {
    switch (severidade) {
      case 'alta':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'media':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'baixa':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  return (
    <ProtectedRoute allowedProfiles={[TipoPerfil.CHEFE_MEDICOS]}>
      <div className="space-y-6">
        {/* Header com botão de ação */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Geral</h1>
            <p className="text-gray-600 mt-1">Visão completa do sistema</p>
          </div>
          <Button
            onClick={handleCriarOcorrencia}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Criar Nova Ocorrência
          </Button>
        </div>

        {/* Grid de Estatísticas - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Ambulâncias Ativas */}
          <StatsCard
            title="Ambulâncias Ativas"
            value={stats.ambulanciasAtivas}
            description="Em operação agora"
            icon={Ambulance}
            iconColor="text-blue-600"
            loading={isLoading}
          />

          {/* Card 2: Profissionais Disponíveis */}
          <StatsCard
            title="Profissionais Disponíveis"
            value={stats.profissionaisDisponiveis}
            description="Escalados para hoje"
            icon={Users}
            iconColor="text-green-600"
            loading={isLoading}
          />

          {/* Card 3: Ocorrências (com filtro de período) */}
          <StatsCard
            title="Ocorrências"
            value={
              periodo === 'hoje'
                ? stats.ocorrenciasHoje
                : periodo === 'semana'
                ? stats.ocorrenciasSemana
                : stats.ocorrenciasMes
            }
            description={
              periodo === 'hoje'
                ? 'Hoje'
                : periodo === 'semana'
                ? 'Esta semana'
                : 'Este mês'
            }
            icon={Activity}
            iconColor="text-purple-600"
            loading={isLoading}
            onClick={() => {
              // Trocar período
              if (periodo === 'hoje') setPeriodo('semana');
              else if (periodo === 'semana') setPeriodo('mes');
              else setPeriodo('hoje');
            }}
          />

          {/* Card 4: Tempo Médio de Resposta */}
          <StatsCard
            title="Tempo Médio"
            value={formatarTempo(stats.tempoMedioResposta)}
            description="Duração média (última semana)"
            icon={Clock}
            iconColor="text-orange-600"
            loading={isLoading}
          />
        </div>

        {/* Seção de Avisos */}
        {avisos.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Avisos e Alertas ({avisos.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {avisos.slice(0, 6).map((aviso) => (
                <Card
                  key={aviso.id}
                  className={`p-4 border ${getAvisoColor(aviso.severidade)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAvisoIcon(aviso.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{aviso.titulo}</p>
                      <p className="text-xs mt-1 opacity-90">{aviso.descricao}</p>
                      {aviso.data && (
                        <p className="text-xs mt-2 opacity-75">
                          Vencimento: {new Date(aviso.data).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {avisos.length > 6 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  Ver todos os {avisos.length} avisos
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State de Avisos */}
        {!isLoading && avisos.length === 0 && (
          <Card className="p-8 text-center border-dashed">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-green-100 p-3">
                <AlertCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tudo em Ordem!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Não há avisos ou alertas no momento
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
