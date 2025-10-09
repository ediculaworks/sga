'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ambulance, MapPin, Clock, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmbulanciaAtiva {
  id: number;
  placa: string;
  modelo: string;
  tipo_atual: string;
  ocorrencia?: {
    numero_ocorrencia: string;
    local_ocorrencia: string;
  };
  rastreamento?: {
    velocidade?: number;
    ultima_atualizacao: string;
  };
}

interface PainelAmbulanciasProps {
  ambulanciaSelecionada: number | null;
  onSelecionarAmbulancia: (id: number | null) => void;
}

export function PainelAmbulancias({
  ambulanciaSelecionada,
  onSelecionarAmbulancia,
}: PainelAmbulanciasProps) {
  // Query para buscar ambulâncias ativas (mesma do mapa)
  const { data: ambulancias, isLoading } = useQuery({
    queryKey: ['ambulancias-ativas'],
    queryFn: async (): Promise<AmbulanciaAtiva[]> => {
      const { data, error } = await supabase
        .from('ambulancias')
        .select(
          `
          id,
          placa,
          modelo,
          tipo_atual,
          ocorrencias:ocorrencias!ambulancia_id(
            numero_ocorrencia,
            local_ocorrencia,
            status_ocorrencia
          )
        `
        )
        .eq('status_ambulancia', 'EM_OPERACAO');

      if (error) {
        console.error('Erro ao buscar ambulâncias:', error);
        return [];
      }

      const ambulanciasComRastreamento = await Promise.all(
        (data || []).map(async (ambulancia: any) => {
          const { data: rastreamento } = await supabase
            .from('rastreamento_ambulancias')
            .select('velocidade, data_hora')
            .eq('ambulancia_id', ambulancia.id)
            .order('data_hora', { ascending: false })
            .limit(1)
            .single();

          const ocorrenciaAtiva = ambulancia.ocorrencias?.find(
            (occ: any) =>
              occ.status_ocorrencia === 'EM_ANDAMENTO' ||
              occ.status_ocorrencia === 'CONFIRMADA'
          );

          return {
            id: ambulancia.id,
            placa: ambulancia.placa,
            modelo: ambulancia.modelo,
            tipo_atual: ambulancia.tipo_atual,
            ocorrencia: ocorrenciaAtiva
              ? {
                  numero_ocorrencia: ocorrenciaAtiva.numero_ocorrencia,
                  local_ocorrencia: ocorrenciaAtiva.local_ocorrencia,
                }
              : undefined,
            rastreamento: rastreamento
              ? {
                  velocidade: rastreamento.velocidade,
                  ultima_atualizacao: rastreamento.data_hora,
                }
              : undefined,
          };
        })
      );

      return ambulanciasComRastreamento.filter((amb) => amb.rastreamento);
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });

  const getTipoColor = (tipo: string) => {
    return tipo === 'EMERGENCIA' ? 'text-red-600' : 'text-blue-600';
  };

  const getTipoBgColor = (tipo: string) => {
    return tipo === 'EMERGENCIA' ? 'bg-red-50' : 'bg-blue-50';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ambulâncias Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Ambulance className="w-5 h-5 text-blue-600" />
          Ambulâncias Ativas
        </CardTitle>
        {ambulancias && ambulancias.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {ambulancias.length} em operação
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-3 pr-2">
        {!ambulancias || ambulancias.length === 0 ? (
          <div className="text-center py-12">
            <Ambulance className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhuma ambulância em operação</p>
          </div>
        ) : (
          ambulancias.map((ambulancia) => (
            <div
              key={ambulancia.id}
              onClick={() =>
                onSelecionarAmbulancia(
                  ambulanciaSelecionada === ambulancia.id ? null : ambulancia.id
                )
              }
              className={cn(
                'p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md',
                ambulanciaSelecionada === ambulancia.id
                  ? 'border-blue-500 shadow-md bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Ambulance
                    className={cn('w-5 h-5', getTipoColor(ambulancia.tipo_atual || 'BASICA'))}
                    fill="currentColor"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{ambulancia.placa}</p>
                    <p className="text-xs text-gray-600">{ambulancia.modelo}</p>
                  </div>
                </div>

                <span
                  className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    getTipoBgColor(ambulancia.tipo_atual || 'BASICA'),
                    getTipoColor(ambulancia.tipo_atual || 'BASICA')
                  )}
                >
                  {ambulancia.tipo_atual === 'EMERGENCIA' ? 'Emergência' : 'Básica'}
                </span>
              </div>

              {/* Ocorrência */}
              {ambulancia.ocorrencia && (
                <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Ocorrência Atual</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ambulancia.ocorrencia.numero_ocorrencia}
                  </p>
                  <div className="flex items-start gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {ambulancia.ocorrencia.local_ocorrencia}
                    </p>
                  </div>
                </div>
              )}

              {/* Info de Rastreamento */}
              <div className="space-y-2">
                {ambulancia.rastreamento?.velocidade !== undefined && (
                  <div className="flex items-center gap-2 text-xs">
                    <Gauge className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">Velocidade:</span>
                    <span className="font-medium text-gray-900">
                      {ambulancia.rastreamento.velocidade} km/h
                    </span>
                  </div>
                )}

                {ambulancia.rastreamento?.ultima_atualizacao && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    Atualizado há{' '}
                    {Math.floor(
                      (Date.now() -
                        new Date(ambulancia.rastreamento.ultima_atualizacao).getTime()) /
                        60000
                    )}{' '}
                    min
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
