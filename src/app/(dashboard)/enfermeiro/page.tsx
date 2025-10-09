'use client';

import { useAuth } from '@/hooks/useAuth';
import { useMedicoStats } from '@/hooks/useMedicoStats';
import { useOcorrenciasDisponiveis } from '@/hooks/useOcorrenciasDisponiveis';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { OcorrenciaCard } from '@/components/ocorrencias/OcorrenciaCard';
import { OcorrenciaDetalhesModal } from '@/components/ocorrencias/OcorrenciaDetalhesModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// ProtectedRoute removido - autenticação agora é feita via middleware
import { ocorrenciasService } from '@/lib/services/ocorrencias';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  DollarSign,
  Ambulance,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { TipoPerfil } from '@/types';

/**
 * Dashboard do Enfermeiro
 *
 * Exibe estatísticas de ocorrências atendidas, pagamentos pendentes e remoções.
 * Similar ao dashboard do médico, adaptado para o perfil ENFERMEIRO.
 */

function EnfermeiroDashboardContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { stats, isLoading, periodo, setPeriodo } = useMedicoStats(user?.id || 0);
  const { data: ocorrencias, isLoading: isLoadingOcorrencias, error: errorOcorrencias } = useOcorrenciasDisponiveis(
    user?.id,
    'ENFERMEIRO'
  );
  const [showPagamentosDetalhes, setShowPagamentosDetalhes] = useState(false);
  const [modalOcorrenciaId, setModalOcorrenciaId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmando, setIsConfirmando] = useState(false);

  // Handler para ver detalhes da ocorrência (memoizado)
  const handleVerDetalhes = useCallback((ocorrenciaId: number) => {
    setModalOcorrenciaId(ocorrenciaId);
    setIsModalOpen(true);
  }, []);

  // Handler para fechar modal (memoizado)
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalOcorrenciaId(null);
  }, []);

  // Handler para confirmar participação (memoizado)
  const handleConfirmarParticipacao = useCallback(async (ocorrenciaId: number) => {
    if (!user?.id) {
      toast.error('Usuário não identificado');
      return;
    }

    setIsConfirmando(true);

    try {
      await ocorrenciasService.confirmarParticipacao(
        ocorrenciaId,
        user.id,
        'ENFERMEIRO'
      );

      toast.success('Participação confirmada com sucesso!');

      // Atualizar lista de ocorrências
      queryClient.invalidateQueries({ queryKey: ['ocorrencias-disponiveis'] });
      queryClient.invalidateQueries({ queryKey: ['ocorrencia-detalhes', ocorrenciaId] });

      // Fechar modal
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao confirmar participação:', error);
      toast.error('Erro ao confirmar participação. Tente novamente.');
    } finally {
      setIsConfirmando(false);
    }
  }, [user?.id, queryClient, handleCloseModal]);

  // Formatar valor em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Labels dos períodos
  const periodoLabels = {
    semana: 'Esta semana',
    mes: 'Este mês',
    ano: 'Este ano',
  };

  return (
    <div className="space-y-6">
      {/* Header com filtro de período */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Visão geral das suas atividades</p>
        </div>

        {/* Filtro de período */}
        <div className="flex gap-2">
          <Button
            variant={periodo === 'semana' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriodo('semana')}
          >
            Semana
          </Button>
          <Button
            variant={periodo === 'mes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriodo('mes')}
          >
            Mês
          </Button>
          <Button
            variant={periodo === 'ano' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriodo('ano')}
          >
            Ano
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Ocorrências Atendidas */}
        <StatsCard
          title="Ocorrências Atendidas"
          value={stats.ocorrenciasAtendidas.total}
          description={periodoLabels[periodo]}
          icon={Activity}
          iconColor="text-blue-600"
          trend={
            stats.ocorrenciasAtendidas.trend !== 0
              ? {
                  value: Math.abs(stats.ocorrenciasAtendidas.trend),
                  isPositive: stats.ocorrenciasAtendidas.trend > 0,
                  label: 'vs. período anterior',
                }
              : undefined
          }
          loading={isLoading}
        />

        {/* Card 2: Ocorrências a Receber */}
        <StatsCard
          title="A Receber"
          value={formatCurrency(stats.ocorrenciasAReceber.valorTotal)}
          description={`${stats.ocorrenciasAReceber.total} ${
            stats.ocorrenciasAReceber.total === 1 ? 'pagamento pendente' : 'pagamentos pendentes'
          }`}
          icon={DollarSign}
          iconColor="text-green-600"
          onClick={() => setShowPagamentosDetalhes(!showPagamentosDetalhes)}
          loading={isLoading}
        />

        {/* Card 3: Remoções */}
        <StatsCard
          title="Remoções"
          value={stats.remocoes.total}
          description={periodoLabels[periodo]}
          icon={Ambulance}
          iconColor="text-orange-600"
          loading={isLoading}
        />
      </div>

      {/* Detalhes de Pagamentos Pendentes */}
      {showPagamentosDetalhes && stats.ocorrenciasAReceber.itens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Pagamentos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.ocorrenciasAReceber.itens.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">Ocorrência #{item.id}</p>
                    <p className="text-sm text-gray-500">
                      Pagamento previsto: {new Date(item.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(item.valor)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção de Ocorrências Confirmadas */}
      {ocorrencias && ocorrencias.confirmadas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Minhas Ocorrências Confirmadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ocorrencias.confirmadas.map((ocorrencia) => (
              <OcorrenciaCard
                key={ocorrencia.id}
                ocorrencia={ocorrencia}
                variant="confirmed"
                onVerDetalhes={handleVerDetalhes}
              />
            ))}
          </div>
        </div>
      )}

      {/* Seção de Ocorrências Disponíveis */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Ocorrências Disponíveis
        </h3>

        {/* Loading State */}
        {isLoadingOcorrencias && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-600">Carregando ocorrências...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {errorOcorrencias && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Erro ao carregar ocorrências</p>
                <p className="text-sm text-red-700 mt-1">
                  Tente recarregar a página. Se o problema persistir, entre em contato com o suporte.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoadingOcorrencias && !errorOcorrencias && ocorrencias?.disponiveis.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma ocorrência disponível
              </h4>
              <p className="text-gray-600 max-w-md mx-auto">
                No momento não há ocorrências em aberto que correspondam ao seu perfil e disponibilidade.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lista de Ocorrências Disponíveis */}
        {!isLoadingOcorrencias && !errorOcorrencias && ocorrencias && ocorrencias.disponiveis.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ocorrencias.disponiveis.map((ocorrencia) => (
              <OcorrenciaCard
                key={ocorrencia.id}
                ocorrencia={ocorrencia}
                variant="default"
                onVerDetalhes={handleVerDetalhes}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Ocorrência */}
      <OcorrenciaDetalhesModal
        ocorrenciaId={modalOcorrenciaId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        perfil={user?.tipo_perfil}
        onConfirmarParticipacao={handleConfirmarParticipacao}
        isConfirmando={isConfirmando}
      />
    </div>
  );
}

export default function EnfermeiroDashboard() {
  return <EnfermeiroDashboardContent />;
}
