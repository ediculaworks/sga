import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Ambulance } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Componente de Card de Ocorrência
 *
 * Exibe informações resumidas de uma ocorrência.
 * Usado no dashboard de médicos e enfermeiros.
 *
 * @param ocorrencia - Dados da ocorrência
 * @param variant - Estilo do card (default | confirmed)
 * @param onVerDetalhes - Callback ao clicar em "Ver Detalhes"
 */

interface OcorrenciaCardProps {
  ocorrencia: {
    id: number;
    numero_ocorrencia: string;
    tipo_trabalho: 'EVENTO' | 'DOMICILIAR' | 'EMERGENCIA' | 'TRANSFERENCIA';
    tipo_ambulancia: 'BASICA' | 'EMERGENCIA';
    data_ocorrencia: string;
    horario_saida: string;
    horario_no_local: string;
    local_ocorrencia: string;
    status: 'EM_ABERTO' | 'CONFIRMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA';
    vagas_disponiveis?: number;
    total_vagas?: number;
  };
  variant?: 'default' | 'confirmed';
  onVerDetalhes: (id: number) => void;
}

const STATUS_LABELS = {
  EM_ABERTO: 'Em Aberto',
  CONFIRMADA: 'Confirmada',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDA: 'Concluída',
};

const STATUS_COLORS = {
  EM_ABERTO: 'bg-blue-100 text-blue-800 border-blue-200',
  CONFIRMADA: 'bg-green-100 text-green-800 border-green-200',
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONCLUIDA: 'bg-gray-100 text-gray-800 border-gray-200',
};

const TIPO_TRABALHO_LABELS = {
  EVENTO: 'Evento',
  DOMICILIAR: 'Domiciliar',
  EMERGENCIA: 'Emergência',
  TRANSFERENCIA: 'Transferência',
};

const TIPO_AMBULANCIA_LABELS = {
  BASICA: 'Básica',
  EMERGENCIA: 'Emergência',
};

export function OcorrenciaCard({
  ocorrencia,
  variant = 'default',
  onVerDetalhes,
}: OcorrenciaCardProps) {
  const isConfirmed = variant === 'confirmed';

  return (
    <Card
      className={`transition-all hover:shadow-lg ${
        isConfirmed
          ? 'border-green-200 bg-green-50/50'
          : 'hover:border-blue-400'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              #{ocorrencia.numero_ocorrencia}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={STATUS_COLORS[ocorrencia.status]}
              >
                {STATUS_LABELS[ocorrencia.status]}
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {TIPO_TRABALHO_LABELS[ocorrencia.tipo_trabalho]}
              </Badge>
            </div>
          </div>

          {isConfirmed && (
            <Badge className="bg-green-600 hover:bg-green-700">
              Confirmado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Data e Horário */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(ocorrencia.data_ocorrencia), "dd 'de' MMMM", {
                locale: ptBR,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{ocorrencia.horario_saida}</span>
          </div>
        </div>

        {/* Local */}
        <div className="flex items-start gap-1.5 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{ocorrencia.local_ocorrencia}</span>
        </div>

        {/* Tipo de Ambulância */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Ambulance className="h-4 w-4" />
          <span>Ambulância {TIPO_AMBULANCIA_LABELS[ocorrencia.tipo_ambulancia]}</span>
        </div>

        {/* Vagas (apenas se EM_ABERTO) */}
        {ocorrencia.status === 'EM_ABERTO' && ocorrencia.vagas_disponiveis !== undefined && (
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-600">
              {ocorrencia.vagas_disponiveis} {ocorrencia.vagas_disponiveis === 1 ? 'vaga disponível' : 'vagas disponíveis'}
            </span>
          </div>
        )}

        {/* Botão Ver Detalhes */}
        <Button
          onClick={() => onVerDetalhes(ocorrencia.id)}
          variant={isConfirmed ? 'default' : 'outline'}
          className="w-full mt-2"
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
