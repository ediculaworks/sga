'use client';

import { useState } from 'react';
import { useAmbulanciaEstatisticas } from '@/hooks/useAmbulanciaEstatisticas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Activity, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface AmbulanciaEstatisticasProps {
  ambulanciaId: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AmbulanciaEstatisticas({ ambulanciaId }: AmbulanciaEstatisticasProps) {
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'ano'>('mes');
  const { data, isLoading, error } = useAmbulanciaEstatisticas(ambulanciaId, periodo);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando estatísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">Erro ao carregar estatísticas</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Nenhum dado disponível</div>
      </div>
    );
  }

  // Formatar mês para exibição
  const formatMes = (mes: string) => {
    const [ano, mesNum] = mes.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mesNum) - 1]}/${ano}`;
  };

  // Preparar dados para o gráfico de utilização
  const dadosUtilizacao = data.utilizacao.map((u) => ({
    mes: formatMes(u.mes),
    ocorrencias: u.ocorrencias,
    horas: Math.round(u.horasUso * 10) / 10,
    km: u.kmRodados,
  }));

  // Preparar dados para o gráfico de gastos por tipo
  const gastosPorTipo = data.gastos.reduce((acc, gasto) => {
    const tipo = gasto.tipo_gasto || 'Outros';
    acc[tipo] = (acc[tipo] || 0) + gasto.valor;
    return acc;
  }, {} as Record<string, number>);

  const dadosGastosPorTipo = Object.entries(gastosPorTipo).map(([tipo, valor]) => ({
    name: tipo,
    value: valor,
  }));

  return (
    <div className="space-y-6">
      {/* Header com seletor de período */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Estatísticas e Relatórios</h3>
          <p className="text-sm text-muted-foreground">
            Análise detalhada de utilização e desempenho
          </p>
        </div>
        <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mes">Último mês</SelectItem>
            <SelectItem value="trimestre">Último trimestre</SelectItem>
            <SelectItem value="ano">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ocorrências</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.resumo.totalOcorrencias}</div>
            <p className="text-xs text-muted-foreground">
              Média de {data.resumo.mediaOcorrenciasPorMes.toFixed(1)} por mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quilometragem Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.resumo.totalKm.toFixed(0)} km</div>
            <p className="text-xs text-muted-foreground">
              {(data.resumo.totalKm / data.resumo.totalOcorrencias || 0).toFixed(1)} km por ocorrência
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de Uso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.resumo.totalHoras.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {(data.resumo.totalHoras / data.resumo.totalOcorrencias || 0).toFixed(1)}h por ocorrência
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data.resumo.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Manutenções e gastos operacionais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com gráficos */}
      <Tabs defaultValue="utilizacao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="utilizacao">Utilização</TabsTrigger>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Gráfico de Utilização */}
        <TabsContent value="utilizacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ocorrências por Período</CardTitle>
              <CardDescription>
                Número de ocorrências atendidas ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosUtilizacao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ocorrencias" fill="#0088FE" name="Ocorrências" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horas de Uso e Quilometragem</CardTitle>
              <CardDescription>
                Evolução temporal de horas de uso e quilômetros rodados
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosUtilizacao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="horas"
                    stroke="#00C49F"
                    name="Horas de Uso"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="km"
                    stroke="#FF8042"
                    name="Km Rodados"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico de Gastos */}
        <TabsContent value="gastos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Gastos por Tipo</CardTitle>
              <CardDescription>
                Proporção de gastos por categoria
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosGastosPorTipo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosGastosPorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Performance</CardTitle>
              <CardDescription>
                Métricas consolidadas de desempenho operacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Taxa de Utilização</span>
                  <span className="text-sm text-muted-foreground">
                    {data.resumo.mediaOcorrenciasPorMes.toFixed(1)} ocorrências/mês
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Distância Média por Ocorrência</span>
                  <span className="text-sm text-muted-foreground">
                    {(data.resumo.totalKm / data.resumo.totalOcorrencias || 0).toFixed(1)} km
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Tempo Médio por Ocorrência</span>
                  <span className="text-sm text-muted-foreground">
                    {((data.resumo.totalHoras * 60) / data.resumo.totalOcorrencias || 0).toFixed(0)} minutos
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Custo por Ocorrência</span>
                  <span className="text-sm text-muted-foreground">
                    R$ {(data.resumo.custoTotal / data.resumo.totalOcorrencias || 0).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Custo por Quilômetro</span>
                  <span className="text-sm text-muted-foreground">
                    R$ {(data.resumo.custoTotal / data.resumo.totalKm || 0).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total de Manutenções</span>
                  <span className="text-sm text-muted-foreground">
                    {data.manutencoes.length} registros
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
