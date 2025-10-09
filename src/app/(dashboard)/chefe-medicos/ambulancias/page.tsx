'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// ProtectedRoute removido - autenticação agora é feita via middleware
import { TipoPerfil, type StatusAmbulancia } from '@/types';
import { ambulanciasService } from '@/lib/services/ambulancias';
import { AmbulanciaCard } from '@/components/ambulancias/AmbulanciaCard';
import { CadastrarAmbulanciaModal } from '@/components/ambulancias/CadastrarAmbulanciaModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AmbulanciasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<StatusAmbulancia | 'TODAS'>('TODAS');

  // Query para buscar ambulâncias
  const { data: ambulancias, isLoading, refetch } = useQuery({
    queryKey: ['ambulancias', filtroStatus],
    queryFn: async () => {
      if (filtroStatus === 'TODAS') {
        return await ambulanciasService.getAtivas();
      }
      return await ambulanciasService.getByStatus(filtroStatus);
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  // Função para agrupar ambulâncias por status
  const ambulanciasPorStatus = {
    PRONTA: ambulancias?.filter((amb) => amb.status_ambulancia === 'PRONTA') || [],
    PENDENTE: ambulancias?.filter((amb) => amb.status_ambulancia === 'PENDENTE') || [],
    REVISAO: ambulancias?.filter((amb) => amb.status_ambulancia === 'REVISAO') || [],
    EM_OPERACAO: ambulancias?.filter((amb) => amb.status_ambulancia === 'EM_OPERACAO') || [],
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PRONTA: 'Prontas',
      PENDENTE: 'Pendentes',
      REVISAO: 'Em Revisão',
      EM_OPERACAO: 'Em Operação',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PRONTA: 'bg-green-50 border-green-200',
      PENDENTE: 'bg-yellow-50 border-yellow-200',
      REVISAO: 'bg-orange-50 border-orange-200',
      EM_OPERACAO: 'bg-blue-50 border-blue-200',
    };
    return colors[status] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Ambulâncias</h1>
            <p className="text-gray-600 mt-1">
              Gerencie a frota de ambulâncias do sistema
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Cadastrar Ambulância
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
            <CardDescription>Filtre as ambulâncias por status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="w-64">
                <Select
                  value={filtroStatus}
                  onValueChange={(value) => setFiltroStatus(value as StatusAmbulancia | 'TODAS')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODAS">Todas</SelectItem>
                    <SelectItem value="PRONTA">Prontas</SelectItem>
                    <SelectItem value="PENDENTE">Pendentes</SelectItem>
                    <SelectItem value="REVISAO">Em Revisão</SelectItem>
                    <SelectItem value="EM_OPERACAO">Em Operação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Lista de Ambulâncias */}
        {!isLoading && ambulancias && (
          <>
            {filtroStatus === 'TODAS' ? (
              // Agrupado por status
              <div className="space-y-6">
                {(Object.keys(ambulanciasPorStatus) as Array<keyof typeof ambulanciasPorStatus>).map(
                  (status) => {
                    const grupo = ambulanciasPorStatus[status];
                    if (grupo.length === 0) return null;

                    return (
                      <div key={status}>
                        <div
                          className={`p-4 rounded-t-lg border-2 ${getStatusColor(status)}`}
                        >
                          <h2 className="font-semibold text-gray-900">
                            {getStatusLabel(status)} ({grupo.length})
                          </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-2 border-t-0 rounded-b-lg border-gray-200">
                          {grupo.map((ambulancia) => (
                            <AmbulanciaCard
                              key={ambulancia.id}
                              ambulancia={ambulancia}
                              onUpdate={refetch}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              // Grid simples quando filtrado
              <>
                {ambulancias.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500">
                        Nenhuma ambulância encontrada com este status.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ambulancias.map((ambulancia) => (
                      <AmbulanciaCard
                        key={ambulancia.id}
                        ambulancia={ambulancia}
                        onUpdate={refetch}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

      {/* Modal de Cadastro */}
      <CadastrarAmbulanciaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
