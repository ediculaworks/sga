'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Ambulance, Calendar, Gauge, Wrench, DollarSign, Activity, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Ambulancia, Ocorrencia, GastoAmbulancia } from '@/types';

interface AmbulanciaDetalhesModalProps {
  ambulanciaId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function AmbulanciaDetalhesModal({
  ambulanciaId,
  isOpen,
  onClose,
  onUpdate,
}: AmbulanciaDetalhesModalProps) {
  const router = useRouter();

  // Query para buscar dados da ambulância
  const { data: ambulancia, isLoading } = useQuery({
    queryKey: ['ambulancia-detalhes', ambulanciaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ambulancias')
        .select('*')
        .eq('id', ambulanciaId)
        .single();

      if (error) throw error;
      return data as Ambulancia;
    },
    enabled: isOpen && !!ambulanciaId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  // Query para buscar últimas ocorrências
  const { data: ultimasOcorrencias } = useQuery({
    queryKey: ['ambulancia-ocorrencias', ambulanciaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .eq('ambulancia_id', ambulanciaId)
        .order('data_ocorrencia', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Ocorrencia[];
    },
    enabled: isOpen && !!ambulanciaId,
  });

  // Query para buscar gastos
  const { data: gastos } = useQuery({
    queryKey: ['ambulancia-gastos', ambulanciaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gastos_ambulancias')
        .select('*')
        .eq('ambulancia_id', ambulanciaId)
        .order('data_gasto', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as GastoAmbulancia[];
    },
    enabled: isOpen && !!ambulanciaId,
  });

  // Query para buscar estatísticas
  const { data: estatisticas } = useQuery({
    queryKey: ['ambulancia-estatisticas', ambulanciaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_estatisticas_ambulancias')
        .select('*')
        .eq('id', ambulanciaId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!ambulanciaId,
  });

  // Funções auxiliares
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PRONTA: 'Pronta',
      PENDENTE: 'Pendente',
      REVISAO: 'Em Revisão',
      EM_OPERACAO: 'Em Operação',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PRONTA: 'bg-green-100 text-green-800 border-green-200',
      PENDENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      REVISAO: 'bg-orange-100 text-orange-800 border-orange-200',
      EM_OPERACAO: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTipoLabel = (tipo: string | null | undefined) => {
    if (!tipo) return 'Não definido';

    const labels: Record<string, string> = {
      USB: 'USB (Suporte Básico)',
      UTI: 'UTI (Terapia Intensiva)',
      // Compatibilidade com valores antigos
      BASICA: 'USB (Suporte Básico)',
      EMERGENCIA: 'UTI (Terapia Intensiva)',
    };
    return labels[tipo] || tipo;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const totalGastos = gastos?.reduce((sum, gasto) => sum + gasto.valor, 0) || 0;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carregando detalhes da ambulância...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!ambulancia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ambulance className="w-8 h-8 text-blue-600" />
              <div>
                <DialogTitle className="text-2xl">{ambulancia.placa}</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {ambulancia.marca} {ambulancia.modelo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(ambulancia.status_ambulancia)}>
                {getStatusLabel(ambulancia.status_ambulancia)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push(`/chefe-ambulancias/ambulancias/${ambulanciaId}`);
                  onClose();
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Detalhes Completos
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações Técnicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                Informações Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Ano</p>
                <p className="font-medium text-gray-900">{ambulancia.ano}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo Atual</p>
                <p className="font-medium text-gray-900">{getTipoLabel(ambulancia.tipo_atual)}</p>
              </div>
              {ambulancia.motor && (
                <div>
                  <p className="text-sm text-gray-600">Motor</p>
                  <p className="font-medium text-gray-900">{ambulancia.motor}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Kilometragem Atual</p>
                <p className="font-medium text-gray-900">
                  {ambulancia.kilometragem.toLocaleString('pt-BR')} km
                </p>
              </div>
              {ambulancia.ultima_revisao && (
                <div>
                  <p className="text-sm text-gray-600">Última Revisão</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(ambulancia.ultima_revisao)}
                  </p>
                </div>
              )}
              {ambulancia.kilometragem_proxima_revisao && (
                <div>
                  <p className="text-sm text-gray-600">Próxima Revisão</p>
                  <p className="font-medium text-gray-900">
                    {ambulancia.kilometragem_proxima_revisao.toLocaleString('pt-BR')} km
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas */}
          {estatisticas && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Estatísticas de Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {estatisticas.total_ocorrencias}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Ocorrências</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {estatisticas.total_emergencias}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Emergências</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {estatisticas.total_eventos}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Eventos</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      R$ {estatisticas.total_gastos?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Gastos Totais</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Últimas Ocorrências */}
          {ultimasOcorrencias && ultimasOcorrencias.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Últimas Ocorrências ({ultimasOcorrencias.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ultimasOcorrencias.map((ocorrencia) => (
                    <div key={ocorrencia.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{ocorrencia.numero_ocorrencia}</p>
                        <p className="text-sm text-gray-600 mt-1">{ocorrencia.local_ocorrencia}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{formatDate(ocorrencia.data_ocorrencia)}</p>
                        <Badge variant="outline" className="mt-1">
                          {ocorrencia.tipo_trabalho}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gastos Recentes */}
          {gastos && gastos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Gastos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gastos.map((gasto) => (
                    <div key={gasto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{gasto.tipo_gasto}</p>
                        {gasto.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{gasto.descricao}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">R$ {gasto.valor.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(gasto.data_gasto)}</p>
                      </div>
                    </div>
                  ))}

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <p className="font-semibold text-gray-900">Total</p>
                    <p className="text-xl font-bold text-green-600">R$ {totalGastos.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
