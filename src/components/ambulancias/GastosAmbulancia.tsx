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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Search, TrendingUp, TrendingDown } from 'lucide-react';

interface Gasto {
  id: number;
  tipo_gasto: string;
  descricao: string;
  valor: number;
  data_gasto: string;
  responsavel: string;
}

interface GastosAmbulanciaProps {
  gastos: Gasto[];
}

const TIPO_GASTO_MAP: Record<string, { label: string; color: string }> = {
  combustivel: { label: 'Combustível', color: 'bg-blue-500' },
  manutencao: { label: 'Manutenção', color: 'bg-orange-500' },
  seguro: { label: 'Seguro', color: 'bg-purple-500' },
  licenciamento: { label: 'Licenciamento', color: 'bg-green-500' },
  pedagio: { label: 'Pedágio', color: 'bg-yellow-500' },
  estacionamento: { label: 'Estacionamento', color: 'bg-pink-500' },
  multa: { label: 'Multa', color: 'bg-red-500' },
  outro: { label: 'Outro', color: 'bg-gray-500' },
};

export function GastosAmbulancia({ gastos }: GastosAmbulanciaProps) {
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');

  // Filtrar gastos
  const gastosFiltrados = gastos.filter((gasto) => {
    const termoBusca = busca.toLowerCase();
    const matchBusca =
      gasto.descricao.toLowerCase().includes(termoBusca) ||
      gasto.responsavel.toLowerCase().includes(termoBusca) ||
      gasto.tipo_gasto.toLowerCase().includes(termoBusca);

    const matchTipo = tipoFiltro === 'todos' || gasto.tipo_gasto === tipoFiltro;

    return matchBusca && matchTipo;
  });

  // Calcular estatísticas
  const totalGastos = gastos.reduce((sum, g) => sum + g.valor, 0);
  const gastosUltimoMes = gastos.filter((g) => {
    const data = new Date(g.data_gasto);
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);
    return data >= umMesAtras;
  });
  const totalUltimoMes = gastosUltimoMes.reduce((sum, g) => sum + g.valor, 0);

  const gastosMesAnterior = gastos.filter((g) => {
    const data = new Date(g.data_gasto);
    const doisMesesAtras = new Date();
    doisMesesAtras.setMonth(doisMesesAtras.getMonth() - 2);
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);
    return data >= doisMesesAtras && data < umMesAtras;
  });
  const totalMesAnterior = gastosMesAnterior.reduce((sum, g) => sum + g.valor, 0);

  const tendencia = totalMesAnterior > 0
    ? ((totalUltimoMes - totalMesAnterior) / totalMesAnterior) * 100
    : 0;

  // Gastos por tipo
  const gastosPorTipo = gastos.reduce((acc, gasto) => {
    const tipo = gasto.tipo_gasto || 'outro';
    acc[tipo] = (acc[tipo] || 0) + gasto.valor;
    return acc;
  }, {} as Record<string, number>);

  const tipoMaisCaro = Object.entries(gastosPorTipo).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalGastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {gastos.length} registros no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Mês</CardTitle>
            {tendencia >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalUltimoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {tendencia >= 0 ? '+' : ''}
              {tendencia.toFixed(1)}% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Categoria</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tipoMaisCaro
                ? TIPO_GASTO_MAP[tipoMaisCaro[0]]?.label || tipoMaisCaro[0]
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {tipoMaisCaro
                ? `R$ ${tipoMaisCaro[1].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
          <CardDescription>
            Gastos totais por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(gastosPorTipo)
              .sort((a, b) => b[1] - a[1])
              .map(([tipo, valor]) => {
                const config = TIPO_GASTO_MAP[tipo] || { label: tipo, color: 'bg-gray-500' };
                const percentual = (valor / totalGastos) * 100;

                return (
                  <div key={tipo} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{config.label}</span>
                      <span className="text-muted-foreground">
                        R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (
                        {percentual.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${config.color} transition-all`}
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Gastos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Gastos</CardTitle>
          <CardDescription>
            Registro detalhado de todos os gastos operacionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou responsável..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  {Object.entries(TIPO_GASTO_MAP).map(([tipo, config]) => (
                    <SelectItem key={tipo} value={tipo}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(busca || tipoFiltro !== 'todos') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setBusca('');
                    setTipoFiltro('todos');
                  }}
                >
                  Limpar
                </Button>
              )}
            </div>

            {/* Tabela */}
            {gastosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {busca || tipoFiltro !== 'todos'
                    ? 'Nenhum gasto encontrado com os critérios de busca'
                    : 'Nenhum gasto registrado'}
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
                      <TableHead>Responsável</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gastosFiltrados
                      .sort(
                        (a, b) =>
                          new Date(b.data_gasto).getTime() - new Date(a.data_gasto).getTime()
                      )
                      .map((gasto) => {
                        const config = TIPO_GASTO_MAP[gasto.tipo_gasto] || {
                          label: gasto.tipo_gasto,
                          color: 'bg-gray-500',
                        };

                        return (
                          <TableRow key={gasto.id}>
                            <TableCell className="font-medium">
                              {format(new Date(gasto.data_gasto), 'dd/MM/yyyy', {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{config.label}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {gasto.descricao}
                            </TableCell>
                            <TableCell>{gasto.responsavel}</TableCell>
                            <TableCell className="text-right font-medium">
                              R${' '}
                              {gasto.valor.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Contador de resultados */}
            {(busca || tipoFiltro !== 'todos') && gastosFiltrados.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Mostrando {gastosFiltrados.length} de {gastos.length} gastos
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
