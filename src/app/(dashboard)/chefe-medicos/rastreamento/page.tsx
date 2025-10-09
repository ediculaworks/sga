'use client';

import { useState } from 'react';
import { MapaRastreamento } from '@/components/rastreamento/MapaRastreamento';
import { PainelAmbulancias } from '@/components/rastreamento/PainelAmbulancias';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TipoPerfil } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Info } from 'lucide-react';

export default function RastreamentoPage() {
  const [ambulanciaSelecionada, setAmbulanciaSelecionada] = useState<number | null>(null);

  return (
    <ProtectedRoute perfisPermitidos={[TipoPerfil.CHEFE_MEDICOS]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-blue-600" />
            Rastreamento de Ambulâncias
          </h1>
          <p className="text-gray-600 mt-2">
            Monitore em tempo real a localização de todas as ambulâncias em operação
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Como funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-1">
            <p>• Ambulâncias em operação aparecem como markers no mapa</p>
            <p>• Clique em um marker ou na lista lateral para ver detalhes</p>
            <p>• A localização é atualizada automaticamente em tempo real</p>
            <p>• Cores diferentes indicam o tipo de ambulância (Básica/Emergência)</p>
          </CardContent>
        </Card>

        {/* Mapa e Painel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Painel Lateral - Lista de Ambulâncias */}
          <div className="lg:col-span-1">
            <PainelAmbulancias
              ambulanciaSelecionada={ambulanciaSelecionada}
              onSelecionarAmbulancia={setAmbulanciaSelecionada}
            />
          </div>

          {/* Mapa */}
          <div className="lg:col-span-3">
            <MapaRastreamento
              ambulanciaSelecionada={ambulanciaSelecionada}
              onSelecionarAmbulancia={setAmbulanciaSelecionada}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
