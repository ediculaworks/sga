'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Filter, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

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
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TIPO_AMBULANCIA_LABELS,
  TIPO_TRABALHO_LABELS,
  getBadgeColor,
} from '@/lib/utils/styles';

interface OcorrenciasTableProps {
  onVerDetalhes?: (ocorrencia: Ocorrencia) => void;
  onExcluir?: (ocorrenciaId: number) => void;
}

export function OcorrenciasTable({ onVerDetalhes, onExcluir }: OcorrenciasTableProps) {
  // Estados de filtros
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('TODOS');
  const [tipoTrabalhoFiltro, setTipoTrabalhoFiltro] = useState<string>('TODOS');
  const [tipoAmbulanciaPaddedFiltro, setTipoAmbulanciaPaddedFiltro] = useState<string>('TODOS');

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  /**
   * Query para buscar ocorrências
   * Nota: Não fazemos join com ambulancias aqui devido a problemas de RLS
   * A placa será obtida em uma query separada se necessário
   */
  const { data: ocorrenciasRaw, isLoading } = useQuery({
    queryKey: ['ocorrencias-completas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*');

      if (error) throw error;
      return data as Ocorrencia[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  /**
   * Ordenar ocorrências: EM_ANDAMENTO → CONFIRMADA → EM_ABERTO → CONCLUIDA
   */
  const ocorrencias = ocorrenciasRaw?.sort((a, b) => {
    const prioridades: Record<StatusOcorrencia, number> = {
      [StatusOcorrencia.EM_ANDAMENTO]: 1,
      [StatusOcorrencia.CONFIRMADA]: 2,
      [StatusOcorrencia.EM_ABERTO]: 3,
      [StatusOcorrencia.CONCLUIDA]: 4,
    };

    const prioridadeA = prioridades[a.status_ocorrencia] || 999;
    const prioridadeB = prioridades[b.status_ocorrencia] || 999;

    // Se mesma prioridade, ordenar por data decrescente
    if (prioridadeA === prioridadeB) {
      return new Date(b.data_ocorrencia).getTime() - new Date(a.data_ocorrencia).getTime();
    }

    return prioridadeA - prioridadeB;
  });

  /**
   * Filtra ocorrências por busca e filtros (memoizado)
   */
  const ocorrenciasFiltradas = useMemo(() => {
    return ocorrencias?.filter((occ) => {
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
  }, [ocorrencias, busca, statusFiltro, tipoTrabalhoFiltro, tipoAmbulanciaPaddedFiltro]);

  /**
   * Paginação (memoizado)
   */
  const { totalPaginas, ocorrenciasPaginadas } = useMemo(() => {
    const total = Math.ceil((ocorrenciasFiltradas?.length || 0) / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const paginadas = ocorrenciasFiltradas?.slice(inicio, fim);

    return { totalPaginas: total, ocorrenciasPaginadas: paginadas };
  }, [ocorrenciasFiltradas, paginaAtual]);

  /**
   * Retorna classe de background baseado no status (memoizado)
   */
  const getRowClassName = useCallback((status: StatusOcorrencia) => {
    if (status === StatusOcorrencia.EM_ANDAMENTO) {
      return 'bg-green-50 hover:bg-green-100';
    }
    if (status === StatusOcorrencia.CONFIRMADA) {
      return 'bg-blue-50 hover:bg-blue-100';
    }
    return 'hover:bg-gray-50';
  }, []);

  /**
   * Handlers (memoizados)
   */
  const handleBuscaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(e.target.value);
    setPaginaAtual(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFiltro(value);
    setPaginaAtual(1);
  }, []);

  const handleTipoTrabalhoChange = useCallback((value: string) => {
    setTipoTrabalhoFiltro(value);
    setPaginaAtual(1);
  }, []);

  const handleTipoAmbulanciaChange = useCallback((value: string) => {
    setTipoAmbulanciaPaddedFiltro(value);
    setPaginaAtual(1);
  }, []);

  const handleVerDetalhes = useCallback((occ: Ocorrencia) => {
    if (onVerDetalhes) {
      onVerDetalhes(occ);
    }
  }, [onVerDetalhes]);

  const handleExcluir = useCallback((ocorrenciaId: number, numeroOcorrencia: string) => {
    if (onExcluir && confirm(`Tem certeza que deseja excluir a ocorrência ${numeroOcorrencia}?`)) {
      onExcluir(ocorrenciaId);
    }
  }, [onExcluir]);

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
            onChange={handleBuscaChange}
            className="pl-9"
          />
        </div>

        {/* Filtro de Status */}
        <Select
          value={statusFiltro}
          onValueChange={handleStatusChange}
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
          </SelectContent>
        </Select>

        {/* Filtro de Tipo de Trabalho */}
        <Select
          value={tipoTrabalhoFiltro}
          onValueChange={handleTipoTrabalhoChange}
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
          onValueChange={handleTipoAmbulanciaChange}
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
                  <Badge className={`${STATUS_COLORS[occ.status_ocorrencia]} whitespace-nowrap`}>
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
                  {occ.ambulancia_id ? (
                    <span className="font-mono font-medium">
                      ID: {occ.ambulancia_id}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Não atribuída</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerDetalhes(occ)}
                    >
                      Ver Detalhes
                    </Button>
                    {onExcluir && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleExcluir(occ.id, occ.numero_ocorrencia)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
