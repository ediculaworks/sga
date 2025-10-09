'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Search, Wrench } from 'lucide-react';

interface Manutencao {
  id: number;
  tipo_manutencao: string;
  descricao: string;
  data_manutencao: string;
  custo: number;
  oficina: string;
  status: string;
}

interface ManutencaoHistoricoProps {
  manutencoes: Manutencao[];
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  concluida: { label: 'Concluída', variant: 'default' },
  em_andamento: { label: 'Em Andamento', variant: 'secondary' },
  agendada: { label: 'Agendada', variant: 'outline' },
  cancelada: { label: 'Cancelada', variant: 'destructive' },
};

const TIPO_MAP: Record<string, string> = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
  emergencial: 'Emergencial',
  revisao: 'Revisão',
};

export function ManutencaoHistorico({ manutencoes }: ManutencaoHistoricoProps) {
  const [busca, setBusca] = useState('');

  // Filtrar manutenções pela busca
  const manutencoesFiltradas = manutencoes.filter((manutencao) => {
    const termoBusca = busca.toLowerCase();
    return (
      manutencao.tipo_manutencao.toLowerCase().includes(termoBusca) ||
      manutencao.descricao.toLowerCase().includes(termoBusca) ||
      manutencao.oficina.toLowerCase().includes(termoBusca) ||
      manutencao.status.toLowerCase().includes(termoBusca)
    );
  });

  // Calcular estatísticas
  const totalManutencoes = manutencoes.length;
  const custoTotal = manutencoes.reduce((sum, m) => sum + (m.custo || 0), 0);
  const manutencoesRecentes = manutencoes.filter((m) => {
    const data = new Date(m.data_manutencao);
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    return data >= tresMesesAtras;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Manutenções</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalManutencoes}</div>
            <p className="text-xs text-muted-foreground">
              {manutencoesRecentes} nos últimos 3 meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Média de R$ {(custoTotal / totalManutencoes || 0).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })} por manutenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Manutenção</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const agendadas = manutencoes.filter((m) => m.status === 'agendada');
                if (agendadas.length === 0) return 'N/A';
                const proxima = agendadas.sort(
                  (a, b) => new Date(a.data_manutencao).getTime() - new Date(b.data_manutencao).getTime()
                )[0];
                return format(new Date(proxima.data_manutencao), 'dd/MM', { locale: ptBR });
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {manutencoes.filter((m) => m.status === 'agendada').length} agendadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Busca e Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Completo de Manutenções</CardTitle>
          <CardDescription>
            Registro de todas as manutenções realizadas e agendadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Campo de busca */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tipo, descrição, oficina ou status..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8"
                />
              </div>
              {busca && (
                <Button variant="outline" onClick={() => setBusca('')}>
                  Limpar
                </Button>
              )}
            </div>

            {/* Tabela de manutenções */}
            {manutencoesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {busca
                    ? 'Nenhuma manutenção encontrada com os critérios de busca'
                    : 'Nenhuma manutenção registrada'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Oficina</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manutencoesFiltradas
                      .sort(
                        (a, b) =>
                          new Date(b.data_manutencao).getTime() - new Date(a.data_manutencao).getTime()
                      )
                      .map((manutencao) => (
                        <TableRow key={manutencao.id}>
                          <TableCell className="font-medium">
                            {format(new Date(manutencao.data_manutencao), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell>
                            {TIPO_MAP[manutencao.tipo_manutencao] || manutencao.tipo_manutencao}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {manutencao.descricao}
                          </TableCell>
                          <TableCell>{manutencao.oficina}</TableCell>
                          <TableCell className="text-right">
                            R${' '}
                            {(manutencao.custo || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                STATUS_MAP[manutencao.status]?.variant || 'default'
                              }
                            >
                              {STATUS_MAP[manutencao.status]?.label || manutencao.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Contador de resultados */}
            {busca && manutencoesFiltradas.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Mostrando {manutencoesFiltradas.length} de {manutencoes.length} manutenções
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
