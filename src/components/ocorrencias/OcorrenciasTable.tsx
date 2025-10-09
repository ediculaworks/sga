'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

import { supabase } from '@/lib/supabase/client';
import type { Ocorrencia } from '@/types';
import { StatusOcorrencia, TipoAmbulancia, TipoTrabalho } from '@/types';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

/**
 * Mapa de cores para status de ocorrência
 */
const STATUS_COLORS: Record<StatusOcorrencia, string> = {
  [StatusOcorrencia.EM_ABERTO]: 'bg-yellow-500',
  [StatusOcorrencia.CONFIRMADA]: 'bg-blue-500',
  [StatusOcorrencia.EM_ANDAMENTO]: 'bg-green-500',
  [StatusOcorrencia.CONCLUIDA]: 'bg-gray-500',
  [StatusOcorrencia.CANCELADA]: 'bg-red-500',
};

/**
 * Mapa de labels para status
 */
const STATUS_LABELS: Record<StatusOcorrencia, string> = {
  [StatusOcorrencia.EM_ABERTO]: 'Em Aberto',
  [StatusOcorrencia.CONFIRMADA]: 'Confirmada',
  [StatusOcorrencia.EM_ANDAMENTO]: 'Em Andamento',
  [StatusOcorrencia.CONCLUIDA]: 'Concluída',
  [StatusOcorrencia.CANCELADA]: 'Cancelada',
};

/**
 * Mapa de labels para tipos de trabalho
 */
const TIPO_TRABALHO_LABELS: Record<TipoTrabalho, string> = {
  [TipoTrabalho.EVENTO]: 'Evento',
  [TipoTrabalho.EMERGENCIA]: 'Emergência',
  [TipoTrabalho.DOMICILIAR]: 'Domiciliar',
  [TipoTrabalho.TRANSFERENCIA]: 'Transferência',
};

/**
 * Mapa de labels para tipos de ambulância
 */
const TIPO_AMBULANCIA_LABELS: Record<TipoAmbulancia, string> = {
  [TipoAmbulancia.BASICA]: 'Básica',
  [TipoAmbulancia.EMERGENCIA]: 'Emergência',
};

interface OcorrenciasTableProps {
  onVerDetalhes?: (ocorrencia: Ocorrencia) => void;
}

export function OcorrenciasTable({ onVerDetalhes }: OcorrenciasTableProps) {
  // Estados de filtros
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('TODOS');
  const [tipoTrabalhoFiltro, setTipoTrabalhoFiltro] = useState<string>('TODOS');
  const [tipoAmbulanciaPaddedFiltro, setTipoAmbulanciaPaddedFiltro] = useState<string>('TODOS');

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  /**
   * Query para buscar ocorrências com joins
   */
  const { data: ocorrencias, isLoading } = useQuery({
    queryKey: ['ocorrencias-completas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select(
          `
          *,
          ambulancia:ambulancias(placa)
        `
        )
        .order('status_ocorrencia', { ascending: true }) // Ativas primeiro
        .order('data_ocorrencia', { ascending: false }); // Mais recentes primeiro

      if (error) throw error;
      return data as (Ocorrencia & { ambulancia?: { placa: string } })[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  /**
   * Filtra ocorrências por busca e filtros
   */
  const ocorrenciasFiltradas = ocorrencias?.filter((occ) => {
    // Filtro de busca (número ou local)
    const buscaLower = busca.toLowerCase();
    const matchBusca =
      !busca ||
      occ.numero_ocorrencia.toLowerCase().includes(buscaLower) ||
      occ.local_ocorrencia.toLowerCase().includes(buscaLower);

    // Filtro de status
    const matchStatus =
      statusFiltro === 'TODOS' || occ.status_ocorrencia === statusFiltro;

    // Filtro de tipo de trabalho
    const matchTipoTrabalho =
      tipoTrabalhoFiltro === 'TODOS' || occ.tipo_trabalho === tipoTrabalhoFiltro;

    // Filtro de tipo de ambulância
    const matchTipoAmbulancia =
      tipoAmbulanciaPaddedFiltro === 'TODOS' ||
      occ.tipo_ambulancia === tipoAmbulanciaPaddedFiltro;

    return matchBusca && matchStatus && matchTipoTrabalho && matchTipoAmbulancia;
  });

  /**
   * Paginação
   */
  const totalPaginas = Math.ceil((ocorrenciasFiltradas?.length || 0) / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const ocorrenciasPaginadas = ocorrenciasFiltradas?.slice(inicio, fim);

  /**
   * Retorna classe de background baseado no status
   */
  const getRowClassName = (status: StatusOcorrencia) => {
    if (status === StatusOcorrencia.EM_ANDAMENTO) {
      return 'bg-green-50 hover:bg-green-100';
    }
    if (status === StatusOcorrencia.CONFIRMADA) {
      return 'bg-blue-50 hover:bg-blue-100';
    }
    return 'hover:bg-gray-50';
  };

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  /**
   * Empty state
   */
  if (!ocorrencias || ocorrencias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-gray-900">
          Nenhuma ocorrência encontrada
        </p>
        <p className="mt-2 text-sm text-gray-500">
          As ocorrências criadas aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Busca */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por número ou local..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1); // Reset para primeira página
            }}
            className="pl-9"
          />
        </div>

        {/* Filtro de Status */}
        <Select
          value={statusFiltro}
          onValueChange={(value) => {
            setStatusFiltro(value);
            setPaginaAtual(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os status</SelectItem>
            <SelectItem value={StatusOcorrencia.EM_ABERTO}>Em Aberto</SelectItem>
            <SelectItem value={StatusOcorrencia.CONFIRMADA}>Confirmada</SelectItem>
            <SelectItem value={StatusOcorrencia.EM_ANDAMENTO}>Em Andamento</SelectItem>
            <SelectItem value={StatusOcorrencia.CONCLUIDA}>Concluída</SelectItem>
            <SelectItem value={StatusOcorrencia.CANCELADA}>Cancelada</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Tipo de Trabalho */}
        <Select
          value={tipoTrabalhoFiltro}
          onValueChange={(value) => {
            setTipoTrabalhoFiltro(value);
            setPaginaAtual(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os tipos</SelectItem>
            <SelectItem value={TipoTrabalho.EVENTO}>Evento</SelectItem>
            <SelectItem value={TipoTrabalho.EMERGENCIA}>Emergência</SelectItem>
            <SelectItem value={TipoTrabalho.DOMICILIAR}>Domiciliar</SelectItem>
            <SelectItem value={TipoTrabalho.TRANSFERENCIA}>Transferência</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Tipo de Ambulância */}
        <Select
          value={tipoAmbulanciaPaddedFiltro}
          onValueChange={(value) => {
            setTipoAmbulanciaPaddedFiltro(value);
            setPaginaAtual(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Ambulância" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todas</SelectItem>
            <SelectItem value={TipoAmbulancia.BASICA}>Básica</SelectItem>
            <SelectItem value={TipoAmbulancia.EMERGENCIA}>Emergência</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Mostrando {ocorrenciasPaginadas?.length || 0} de{' '}
          {ocorrenciasFiltradas?.length || 0} ocorrências
        </p>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ambulância</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ocorrenciasPaginadas?.map((occ) => (
              <TableRow key={occ.id} className={getRowClassName(occ.status_ocorrencia)}>
                <TableCell className="font-mono font-medium">
                  {occ.numero_ocorrencia}
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[occ.status_ocorrencia]}>
                    {STATUS_LABELS[occ.status_ocorrencia]}
                  </Badge>
                </TableCell>
                <TableCell>{TIPO_TRABALHO_LABELS[occ.tipo_trabalho]}</TableCell>
                <TableCell>{TIPO_AMBULANCIA_LABELS[occ.tipo_ambulancia]}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {format(
                        new Date(occ.data_ocorrencia + 'T00:00:00'),
                        'dd/MM/yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{occ.horario_saida}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {occ.local_ocorrencia}
                </TableCell>
                <TableCell>
                  {occ.ambulancia?.placa ? (
                    <span className="font-mono font-medium">
                      {occ.ambulancia.placa}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Não atribuída</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVerDetalhes?.(occ)}
                  >
                    Ver Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty state quando filtros não retornam resultados */}
      {ocorrenciasPaginadas?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Filter className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">
            Nenhuma ocorrência encontrada
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Tente ajustar os filtros para encontrar o que procura.
          </p>
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
            disabled={paginaAtual === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <p className="text-sm text-gray-600">
            Página {paginaAtual} de {totalPaginas}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaAtual === totalPaginas}
          >
            Próximo
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
