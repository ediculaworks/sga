'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PacienteComAtendimento {
  id: number;
  nome_completo: string;
  cpf?: string;
  idade?: number;
  sexo?: string;
  ultimo_atendimento?: {
    data_atendimento: string;
    local_ocorrencia: string;
    medico_nome: string;
    queixa_principal: string;
    numero_ocorrencia: string;
  };
}

interface PacientesTableProps {
  onVerHistorico?: (pacienteId: number) => void;
}

const ITEMS_PER_PAGE = 20;

export function PacientesTable({ onVerHistorico }: PacientesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedico, setSelectedMedico] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);

  // Buscar pacientes com último atendimento
  const { data: pacientes, isLoading } = useQuery({
    queryKey: ['pacientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select(
          `
          id,
          nome_completo,
          cpf,
          idade,
          sexo,
          atendimentos (
            data_atendimento,
            queixa_principal,
            medico_id,
            ocorrencias (
              local_ocorrencia,
              numero_ocorrencia
            ),
            usuarios!atendimentos_medico_id_fkey (
              nome_completo
            )
          )
        `
        )
        .order('nome_completo', { ascending: true });

      if (error) {
        console.error('Erro ao buscar pacientes:', error);
        throw error;
      }

      // Processar dados para pegar último atendimento
      return (data || []).map((paciente: any) => {
        const atendimentos = paciente.atendimentos || [];
        const ultimoAtendimento =
          atendimentos.length > 0
            ? atendimentos.sort(
                (a: any, b: any) =>
                  new Date(b.data_atendimento).getTime() -
                  new Date(a.data_atendimento).getTime()
              )[0]
            : null;

        return {
          id: paciente.id,
          nome_completo: paciente.nome_completo,
          cpf: paciente.cpf,
          idade: paciente.idade,
          sexo: paciente.sexo,
          ultimo_atendimento: ultimoAtendimento
            ? {
                data_atendimento: ultimoAtendimento.data_atendimento,
                local_ocorrencia:
                  ultimoAtendimento.ocorrencias?.local_ocorrencia || '-',
                medico_nome:
                  ultimoAtendimento.usuarios?.nome_completo || '-',
                queixa_principal: ultimoAtendimento.queixa_principal || '-',
                numero_ocorrencia:
                  ultimoAtendimento.ocorrencias?.numero_ocorrencia || '-',
              }
            : undefined,
        };
      }) as PacienteComAtendimento[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Buscar lista de médicos para filtro
  const { data: medicos } = useQuery({
    queryKey: ['medicos-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome_completo')
        .eq('tipo_perfil', 'MEDICO')
        .eq('ativo', true)
        .order('nome_completo', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Filtrar pacientes
  const pacientesFiltrados = useMemo(() => {
    if (!pacientes) return [];

    let filtered = pacientes;

    // Filtro de busca por nome
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por médico
    if (selectedMedico !== 'todos') {
      filtered = filtered.filter((p) => {
        const medicoNome = p.ultimo_atendimento?.medico_nome || '';
        return medicoNome === selectedMedico;
      });
    }

    return filtered;
  }, [pacientes, searchTerm, selectedMedico]);

  // Paginação
  const totalPages = Math.ceil(pacientesFiltrados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pacientesPaginados = pacientesFiltrados.slice(startIndex, endIndex);

  // Resetar para página 1 quando filtros mudarem
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleMedicoChange = (value: string) => {
    setSelectedMedico(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando pacientes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca por nome */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por médico */}
          <div className="w-full md:w-64">
            <Select value={selectedMedico} onValueChange={handleMedicoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os médicos</SelectItem>
                {medicos?.map((medico) => (
                  <SelectItem key={medico.id} value={medico.nome_completo}>
                    {medico.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info de resultados */}
        <div className="mt-3 text-sm text-gray-600">
          Mostrando {pacientesPaginados.length} de {pacientesFiltrados.length}{' '}
          pacientes
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Último Atendimento</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Ocorrência</TableHead>
              <TableHead>Queixa Principal</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pacientesPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm || selectedMedico !== 'todos'
                      ? 'Nenhum paciente encontrado com os filtros aplicados.'
                      : 'Nenhum paciente cadastrado.'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              pacientesPaginados.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="font-medium">
                    {paciente.nome_completo}
                  </TableCell>
                  <TableCell>{paciente.idade || '-'}</TableCell>
                  <TableCell>
                    {paciente.sexo === 'M'
                      ? 'Masculino'
                      : paciente.sexo === 'F'
                      ? 'Feminino'
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {paciente.ultimo_atendimento
                      ? format(
                          new Date(
                            paciente.ultimo_atendimento.data_atendimento
                          ),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {paciente.ultimo_atendimento?.local_ocorrencia || '-'}
                  </TableCell>
                  <TableCell>
                    {paciente.ultimo_atendimento?.medico_nome || '-'}
                  </TableCell>
                  <TableCell>
                    {paciente.ultimo_atendimento?.numero_ocorrencia || '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {paciente.ultimo_atendimento?.queixa_principal || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVerHistorico?.(paciente.id)}
                    >
                      Ver Histórico
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
