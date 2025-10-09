'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Activity, MapPin, User } from 'lucide-react';
import { AmbulanciaEstatisticas } from '@/components/ambulancias/AmbulanciaEstatisticas';
import { ManutencaoHistorico } from '@/components/ambulancias/ManutencaoHistorico';
import { GastosAmbulancia } from '@/components/ambulancias/GastosAmbulancia';
import { useAmbulanciaEstatisticas } from '@/hooks/useAmbulanciaEstatisticas';

export default function AmbulanciaDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const ambulanciaId = params.id ? parseInt(params.id as string) : null;

  // Buscar dados da ambulância
  const { data: ambulancia, isLoading: loadingAmbulancia } = useQuery({
    queryKey: ['ambulancia', ambulanciaId],
    queryFn: async () => {
      if (!ambulanciaId) throw new Error('ID não fornecido');

      const { data, error } = await supabase
        .from('ambulancias')
        .select(`
          *,
          motorista:motoristas(
            id,
            usuario:usuarios(nome_completo)
          )
        `)
        .eq('id', ambulanciaId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!ambulanciaId,
  });

  // Buscar estatísticas para as abas
  const { data: estatisticas, isLoading: loadingEstatisticas } = useAmbulanciaEstatisticas(
    ambulanciaId,
    'mes'
  );

  if (loadingAmbulancia) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando detalhes...</div>
      </div>
    );
  }

  if (!ambulancia) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-muted-foreground">Ambulância não encontrada</div>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    disponivel: { label: 'Disponível', variant: 'default' },
    em_atendimento: { label: 'Em Atendimento', variant: 'secondary' },
    manutencao: { label: 'Em Manutenção', variant: 'destructive' },
    indisponivel: { label: 'Indisponível', variant: 'outline' },
  };

  const statusConfig = STATUS_MAP[ambulancia.status] || { label: ambulancia.status, variant: 'default' };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{ambulancia.placa}</h1>
            <p className="text-muted-foreground">
              {ambulancia.modelo} {ambulancia.ano}
            </p>
          </div>
        </div>
        <Badge variant={statusConfig.variant} className="text-base px-4 py-2">
          {statusConfig.label}
        </Badge>
      </div>

      {/* Informações Básicas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipo</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ambulancia.tipo_ambulancia === 'basico' && 'Básica'}
              {ambulancia.tipo_ambulancia === 'avancado' && 'Avançada'}
              {ambulancia.tipo_ambulancia === 'suporte' && 'Suporte'}
            </div>
            <p className="text-xs text-muted-foreground">
              Classe {ambulancia.tipo_ambulancia}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Localização Atual</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ambulancia.localizacao_atual || 'Base'}
            </div>
            <p className="text-xs text-muted-foreground">
              Última atualização recente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motorista</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ambulancia.motorista?.usuario?.nome_completo || 'Não atribuído'}
            </div>
            <p className="text-xs text-muted-foreground">
              Motorista atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes Técnicos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes Técnicos</CardTitle>
          <CardDescription>Informações do veículo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Marca</p>
              <p className="text-base">{ambulancia.marca}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Modelo</p>
              <p className="text-base">{ambulancia.modelo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ano</p>
              <p className="text-base">{ambulancia.ano}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cor</p>
              <p className="text-base">{ambulancia.cor}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Placa</p>
              <p className="text-base font-mono">{ambulancia.placa}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chassi</p>
              <p className="text-base font-mono">{ambulancia.chassi || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Renavam</p>
              <p className="text-base font-mono">{ambulancia.renavam || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Km Atual</p>
              <p className="text-base">{ambulancia.km_atual?.toLocaleString() || 0} km</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com componentes avançados */}
      <Tabs defaultValue="estatisticas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="manutencao">Manutenções</TabsTrigger>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
        </TabsList>

        <TabsContent value="estatisticas">
          {ambulanciaId && <AmbulanciaEstatisticas ambulanciaId={ambulanciaId} />}
        </TabsContent>

        <TabsContent value="manutencao">
          {estatisticas && <ManutencaoHistorico manutencoes={estatisticas.manutencoes} />}
          {loadingEstatisticas && (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Carregando manutenções...</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="gastos">
          {estatisticas && <GastosAmbulancia gastos={estatisticas.gastos} />}
          {loadingEstatisticas && (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Carregando gastos...</div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
