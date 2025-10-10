'use client';

import { useState } from 'react';
import { Ambulance, Info, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Ambulancia } from '@/types';
import { AmbulanciaDetalhesModal } from './AmbulanciaDetalhesModal';

interface AmbulanciaCardProps {
  ambulancia: Ambulancia;
  onUpdate: () => void;
}

export function AmbulanciaCard({ ambulancia, onUpdate }: AmbulanciaCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PRONTA: 'bg-green-100 text-green-800 border-green-200',
      PENDENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      REVISAO: 'bg-orange-100 text-orange-800 border-orange-200',
      EM_OPERACAO: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Função para obter label do status
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PRONTA: 'Pronta',
      PENDENTE: 'Pendente',
      REVISAO: 'Em Revisão',
      EM_OPERACAO: 'Em Operação',
    };
    return labels[status] || status;
  };

  // Função para obter cor do tipo
  const getTipoColor = (tipo: string | null | undefined) => {
    if (!tipo) return 'bg-gray-100 text-gray-800 border-gray-200';

    const colors: Record<string, string> = {
      USB: 'bg-green-100 text-green-800 border-green-200',
      UTI: 'bg-red-100 text-red-800 border-red-200',
      // Compatibilidade com valores antigos
      BASICA: 'bg-green-100 text-green-800 border-green-200',
      EMERGENCIA: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Função para obter label do tipo
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

  // Verificar se precisa de revisão
  const precisaRevisao = ambulancia.kilometragem_proxima_revisao
    ? ambulancia.kilometragem >= ambulancia.kilometragem_proxima_revisao
    : false;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Ambulance className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-bold text-lg text-gray-900">{ambulancia.placa}</h3>
                <p className="text-sm text-gray-600">
                  {ambulancia.marca} {ambulancia.modelo}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={getStatusColor(ambulancia.status_ambulancia)}>
              {getStatusLabel(ambulancia.status_ambulancia)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Tipo de Ambulância */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tipo:</span>
            <Badge variant="outline" className={getTipoColor(ambulancia.tipo_atual)}>
              {getTipoLabel(ambulancia.tipo_atual)}
            </Badge>
          </div>

          {/* Ano */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Ano:</span>
            <span className="font-medium text-gray-900">{ambulancia.ano}</span>
          </div>

          {/* Kilometragem */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Kilometragem:</span>
            <span className="font-medium text-gray-900">
              {ambulancia.kilometragem.toLocaleString('pt-BR')} km
            </span>
          </div>

          {/* Alerta de Revisão */}
          {precisaRevisao && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
              <Wrench className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-orange-800 font-medium">Precisa de revisão</span>
            </div>
          )}

          {/* Botão de Ver Detalhes */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            <Info className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <AmbulanciaDetalhesModal
        ambulanciaId={ambulancia.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}
