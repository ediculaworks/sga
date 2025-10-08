'use client';

import { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { OcorrenciaDetalhesModal } from '@/components/ocorrencias/OcorrenciaDetalhesModal';
import { Card } from '@/components/ui/card';
import { TipoPerfil } from '@/types';

// Configurar localizer com date-fns
const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Tipo para eventos do calendário
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    ocorrenciaId: number;
    status: string;
    tipo: string;
  };
}

export default function AgendaMedicoPage() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<any>(Views.MONTH);
  const [selectedOcorrenciaId, setSelectedOcorrenciaId] = useState<
    number | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Buscar ocorrências do médico
  const { data: ocorrencias, isLoading } = useQuery({
    queryKey: ['agenda-medico', user?.id, selectedDate],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('ocorrencias_participantes')
        .select(
          `
          id,
          ocorrencia_id,
          confirmado,
          ocorrencias!inner (
            id,
            numero_ocorrencia,
            tipo_trabalho,
            tipo_ambulancia,
            status_ocorrencia,
            local_ocorrencia,
            data_ocorrencia,
            horario_saida,
            horario_chegada_local,
            horario_termino
          )
        `
        )
        .eq('usuario_id', user.id)
        .eq('confirmado', true)
        .order('ocorrencias(data_ocorrencia)', { ascending: true });

      if (error) {
        console.error('Erro ao buscar agenda:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Transformar ocorrências em eventos do calendário
  const events: CalendarEvent[] =
    ocorrencias?.map((participacao: any) => {
      const occ = participacao.ocorrencias;
      // CORREÇÃO: Adicionar 'T00:00:00' para forçar timezone local
      const dataOcorrencia = new Date(occ.data_ocorrencia + 'T00:00:00');

      // Horário de início (horario_saida)
      const [horaInicio, minInicio] = occ.horario_saida.split(':');
      const start = new Date(dataOcorrencia);
      start.setHours(parseInt(horaInicio), parseInt(minInicio), 0, 0);

      // Horário de término (se houver, senão usa +2h do horário_chegada_local ou +4h do inicio)
      let end = new Date(start);
      if (occ.horario_termino) {
        const [horaFim, minFim] = occ.horario_termino.split(':');
        end.setHours(parseInt(horaFim), parseInt(minFim));
      } else if (occ.horario_chegada_local) {
        const [horaChegada, minChegada] =
          occ.horario_chegada_local.split(':');
        end.setHours(parseInt(horaChegada), parseInt(minChegada));
        end.setHours(end.getHours() + 2); // +2h após chegada
      } else {
        end.setHours(start.getHours() + 4); // +4h padrão
      }

      return {
        id: occ.id,
        title: `${occ.numero_ocorrencia} - ${occ.tipo_trabalho}`,
        start,
        end,
        resource: {
          ocorrenciaId: occ.id,
          status: occ.status_ocorrencia,
          tipo: occ.tipo_trabalho,
        },
      };
    }) || [];

  // Handler ao clicar em evento
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedOcorrenciaId(event.resource.ocorrenciaId);
    setIsModalOpen(true);
  };

  // Handler ao fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOcorrenciaId(null);
  };

  // Estilizar eventos por status - CORES CORRIGIDAS
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6'; // Azul padrão

    // CORREÇÃO: Cores consistentes com STATUS_COLORS
    switch (event.resource.status) {
      case 'EM_ABERTO':
        backgroundColor = '#3b82f6'; // Azul - Em Aberto
        break;
      case 'CONFIRMADA':
        backgroundColor = '#10b981'; // Verde - Confirmada
        break;
      case 'EM_ANDAMENTO':
        backgroundColor = '#f59e0b'; // Amarelo/Amber - Em Andamento
        break;
      case 'CONCLUIDA':
        backgroundColor = '#6b7280'; // Cinza - Concluída
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  // Mensagens em português
  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Nenhuma ocorrência neste período.',
    showMore: (total: number) => `+ ${total} mais`,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando agenda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">
            Visualize suas ocorrências confirmadas
          </p>
        </div>
      </div>

      {/* Legenda de cores */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Legenda de Status
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500"></div>
            <span className="text-sm text-gray-600">Em Aberto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600"></div>
            <span className="text-sm text-gray-600">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span className="text-sm text-gray-600">Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-600"></div>
            <span className="text-sm text-gray-600">Concluída</span>
          </div>
        </div>
      </Card>

      {/* Calendário */}
      <Card className="p-6">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          view={currentView}
          onView={setCurrentView}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          date={selectedDate}
          onNavigate={setSelectedDate}
          culture="pt-BR"
        />
      </Card>

      {/* Modal de Detalhes */}
      {selectedOcorrenciaId && (
        <OcorrenciaDetalhesModal
          ocorrenciaId={selectedOcorrenciaId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          perfil={TipoPerfil.MEDICO}
        />
      )}
    </div>
  );
}
