'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Ambulance, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TipoPerfil } from '@/types';
import { OcorrenciaDetalhesModal } from '@/components/ocorrencias/OcorrenciaDetalhesModal';
import { useRastreamentoRealtime } from '@/hooks/useRastreamentoRealtime';

// Imports dinâmicos de react-map-gl (apenas client-side)
import dynamic from 'next/dynamic';

// Token do Mapbox (necessário para o Map)
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Componentes do Mapbox carregados dinamicamente (apenas no cliente)
const Map = dynamic(() => import('react-map-gl').then(mod => mod.default), { ssr: false });
const Marker = dynamic(() => import('react-map-gl').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-map-gl').then(mod => mod.Popup), { ssr: false });
const NavigationControl = dynamic(() => import('react-map-gl').then(mod => mod.NavigationControl), { ssr: false });
const FullscreenControl = dynamic(() => import('react-map-gl').then(mod => mod.FullscreenControl), { ssr: false });

interface AmbulanciaAtiva {
  id: number;
  placa: string;
  modelo: string;
  tipo_atual: string;
  ocorrencia?: {
    id: number;
    numero_ocorrencia: string;
    local_ocorrencia: string;
    tipo_trabalho: string;
  };
  rastreamento?: {
    latitude: number;
    longitude: number;
    velocidade?: number;
    ultima_atualizacao: string;
  };
}

interface MapaRastreamentoProps {
  ambulanciaSelecionada: number | null;
  onSelecionarAmbulancia: (id: number | null) => void;
}

// Centro padrão (Brasil - São Paulo)
const DEFAULT_CENTER = { longitude: -46.6333, latitude: -23.5505 };
const DEFAULT_ZOOM = 12;

export function MapaRastreamento({
  ambulanciaSelecionada,
  onSelecionarAmbulancia,
}: MapaRastreamentoProps) {
  const mapRef = useRef<any>(null);
  const [popupInfo, setPopupInfo] = useState<AmbulanciaAtiva | null>(null);
  const [ocorrenciaModalId, setOcorrenciaModalId] = useState<number | null>(null);
  const [isOcorrenciaModalOpen, setIsOcorrenciaModalOpen] = useState(false);

  // Hook de realtime para atualização automática
  useRastreamentoRealtime();

  // Query para buscar ambulâncias ativas
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
            id,
            numero_ocorrencia,
            local_ocorrencia,
            tipo_trabalho,
            status_ocorrencia
          )
        `
        )
        .eq('status_ambulancia', 'EM_OPERACAO');

      if (error) {
        console.error('Erro ao buscar ambulâncias ativas:', error);
        return [];
      }

      // Buscar rastreamento mais recente de cada ambulância
      const ambulanciasComRastreamento = await Promise.all(
        (data || []).map(async (ambulancia: any) => {
          const { data: rastreamento } = await supabase
            .from('rastreamento_ambulancias')
            .select('latitude, longitude, velocidade, data_hora')
            .eq('ambulancia_id', ambulancia.id)
            .order('data_hora', { ascending: false })
            .limit(1)
            .single();

          // Pegar apenas a ocorrência ativa (EM_ANDAMENTO ou CONFIRMADA)
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
                  id: ocorrenciaAtiva.id,
                  numero_ocorrencia: ocorrenciaAtiva.numero_ocorrencia,
                  local_ocorrencia: ocorrenciaAtiva.local_ocorrencia,
                  tipo_trabalho: ocorrenciaAtiva.tipo_trabalho,
                }
              : undefined,
            rastreamento: rastreamento
              ? {
                  latitude: rastreamento.latitude,
                  longitude: rastreamento.longitude,
                  velocidade: rastreamento.velocidade,
                  ultima_atualizacao: rastreamento.data_hora,
                }
              : undefined,
          };
        })
      );

      // Filtrar apenas ambulâncias com rastreamento ativo
      return ambulanciasComRastreamento.filter((amb) => amb.rastreamento);
    },
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 30, // Atualizar a cada 30 segundos
  });

  // Centralizar mapa na ambulância selecionada
  useEffect(() => {
    if (ambulanciaSelecionada && ambulancias && mapRef.current) {
      const ambulancia = ambulancias.find((amb) => amb.id === ambulanciaSelecionada);
      if (ambulancia?.rastreamento) {
        mapRef.current.flyTo({
          center: [ambulancia.rastreamento.longitude, ambulancia.rastreamento.latitude],
          zoom: 15,
          duration: 1000,
        });
        setPopupInfo(ambulancia);
      }
    }
  }, [ambulanciaSelecionada, ambulancias]);

  // Função para obter cor do marker por tipo
  const getMarkerColor = (tipo: string) => {
    return tipo === 'EMERGENCIA' ? '#ef4444' : '#3b82f6'; // Vermelho ou Azul
  };

  // Abrir modal de detalhes da ocorrência
  const handleVerDetalhes = useCallback((ocorrenciaId: number) => {
    setOcorrenciaModalId(ocorrenciaId);
    setIsOcorrenciaModalOpen(true);
    setPopupInfo(null);
  }, []);

  // Debug: Verificar token
  useEffect(() => {
    console.log('[MapaRastreamento] Mapbox token:', MAPBOX_TOKEN ? 'Configurado ✓' : 'NÃO CONFIGURADO ✗');
    console.log('[MapaRastreamento] Token length:', MAPBOX_TOKEN?.length || 0);
  }, []);

  // Validar token do Mapbox
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'pk.your-mapbox-token-here') {
    return (
      <div className="w-full h-[600px] bg-red-50 rounded-lg flex items-center justify-center border-2 border-red-200">
        <div className="text-center max-w-md p-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Token do Mapbox não configurado
          </h3>
          <p className="text-sm text-red-700 mb-4">
            A variável de ambiente <code className="bg-red-100 px-2 py-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> não está configurada.
          </p>
          <div className="bg-white rounded-lg p-4 text-left text-sm text-gray-700 border border-red-200">
            <p className="font-medium mb-2">Para configurar no Vercel:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Acesse o dashboard do Vercel</li>
              <li>Vá em Settings → Environment Variables</li>
              <li>Adicione: <code className="bg-gray-100 px-1">NEXT_PUBLIC_MAPBOX_TOKEN</code></li>
              <li>Cole seu token do Mapbox</li>
              <li>Faça redeploy do projeto</li>
            </ol>
          </div>
          <p className="text-xs text-red-600 mt-3">
            Consulte <code>MAPBOX_SETUP.md</code> para mais informações
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200 shadow-lg">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: DEFAULT_CENTER.longitude,
            latitude: DEFAULT_CENTER.latitude,
            zoom: DEFAULT_ZOOM,
          }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          reuseMaps
        >
          {/* Controles de Navegação */}
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />

          {/* Markers das Ambulâncias */}
          {ambulancias?.map((ambulancia) =>
            ambulancia.rastreamento ? (
              <Marker
                key={ambulancia.id}
                longitude={ambulancia.rastreamento.longitude}
                latitude={ambulancia.rastreamento.latitude}
                anchor="bottom"
                onClick={(e: any) => {
                  e.originalEvent.stopPropagation();
                  setPopupInfo(ambulancia);
                  onSelecionarAmbulancia(ambulancia.id);
                }}
              >
                <div
                  className="cursor-pointer transition-transform hover:scale-110"
                  style={{
                    color: getMarkerColor(ambulancia.tipo_atual || 'BASICA'),
                  }}
                >
                  <Ambulance className="w-8 h-8 drop-shadow-lg" fill="currentColor" />
                </div>
              </Marker>
            ) : null
          )}

          {/* Popup de Informações */}
          {popupInfo && popupInfo.rastreamento && (
            <Popup
              longitude={popupInfo.rastreamento.longitude}
              latitude={popupInfo.rastreamento.latitude}
              anchor="top"
              onClose={() => {
                setPopupInfo(null);
                onSelecionarAmbulancia(null);
              }}
              closeButton={true}
              closeOnClick={false}
              className="custom-popup"
            >
              <div className="p-3 min-w-[250px]">
                <div className="flex items-center gap-2 mb-3">
                  <Ambulance
                    className="w-5 h-5"
                    style={{ color: getMarkerColor(popupInfo.tipo_atual || 'BASICA') }}
                  />
                  <h3 className="font-bold text-gray-900">{popupInfo.placa}</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Modelo:</span>
                    <span className="ml-2 font-medium text-gray-900">{popupInfo.modelo}</span>
                  </div>

                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {popupInfo.tipo_atual === 'EMERGENCIA' ? 'Emergência' : 'Básica'}
                    </span>
                  </div>

                  {popupInfo.rastreamento.velocidade !== undefined && (
                    <div>
                      <span className="text-gray-600">Velocidade:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {popupInfo.rastreamento.velocidade} km/h
                      </span>
                    </div>
                  )}

                  {popupInfo.ocorrencia && (
                    <>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">Ocorrência Atual</p>
                            <p className="font-medium text-gray-900">
                              {popupInfo.ocorrencia.numero_ocorrencia}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {popupInfo.ocorrencia.local_ocorrencia}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleVerDetalhes(popupInfo.ocorrencia!.id)}
                      >
                        Ver Detalhes da Ocorrência
                      </Button>
                    </>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                    <Clock className="w-3 h-3" />
                    Atualizado há{' '}
                    {Math.floor(
                      (Date.now() - new Date(popupInfo.rastreamento.ultima_atualizacao).getTime()) /
                        60000
                    )}{' '}
                    min
                  </div>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Legenda */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Legenda</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ambulance className="w-4 h-4 text-blue-600" fill="currentColor" />
              <span className="text-xs text-gray-600">Ambulância Básica</span>
            </div>
            <div className="flex items-center gap-2">
              <Ambulance className="w-4 h-4 text-red-600" fill="currentColor" />
              <span className="text-xs text-gray-600">Ambulância Emergência</span>
            </div>
          </div>
        </div>

        {/* Contador */}
        {ambulancias && ambulancias.length > 0 && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {ambulancias.length} ambulância{ambulancias.length > 1 ? 's' : ''} em operação
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Ocorrência */}
      {ocorrenciaModalId && (
        <OcorrenciaDetalhesModal
          ocorrenciaId={ocorrenciaModalId}
          isOpen={isOcorrenciaModalOpen}
          onClose={() => {
            setIsOcorrenciaModalOpen(false);
            setOcorrenciaModalId(null);
          }}
          perfil={TipoPerfil.CHEFE_MEDICOS}
        />
      )}
    </>
  );
}
