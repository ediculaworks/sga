'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';

export default function InspectPage() {
  const [tableName, setTableName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [allTables, setAllTables] = useState<string[]>([]);

  const commonTables = [
    'profiles',
    'ambulancias',
    'ambulancia',
    'motoristas',
    'motorista',
    'ocorrencias',
    'ocorrencia',
    'usuarios',
    'usuario',
    'veiculos',
    'veiculo',
    'atendimentos',
    'atendimento',
    'pacientes',
    'paciente',
    'equipes',
    'equipe',
    'hospitais',
    'hospital',
  ];

  const checkTable = async (table: string) => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(5);

      if (error) {
        setResult({
          table,
          exists: false,
          error: error.message,
        });
      } else {
        setResult({
          table,
          exists: true,
          count,
          columns: data && data.length > 0 ? Object.keys(data[0]) : [],
          sampleData: data,
        });
      }
    } catch (err: any) {
      setResult({
        table,
        exists: false,
        error: err.message,
      });
    }
    setLoading(false);
  };

  const scanAllTables = async () => {
    setLoading(true);
    const found: string[] = [];

    for (const table of commonTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
          found.push(table);
        }
      } catch {
        // Ignora erros
      }
    }

    setAllTables(found);
    setResult({
      scan: true,
      found: found.length,
      tables: found,
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Inspeção do Banco de Dados</CardTitle>
            <CardDescription>
              Verifique quais tabelas existem no seu Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scan Automático */}
            <div>
              <h3 className="font-semibold mb-3">Scan Automático</h3>
              <Button onClick={scanAllTables} disabled={loading} className="w-full">
                {loading ? 'Escaneando...' : 'Escanear Tabelas Comuns'}
              </Button>
            </div>

            {/* Busca Manual */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Busca Manual</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome da tabela (ex: ambulancias)"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkTable(tableName)}
                />
                <Button
                  onClick={() => checkTable(tableName)}
                  disabled={!tableName || loading}
                >
                  Verificar
                </Button>
              </div>
            </div>

            {/* Sugestões de Tabelas */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Tabelas Comuns - Clique para Verificar:</h3>
              <div className="flex flex-wrap gap-2">
                {commonTables.map((table) => (
                  <button
                    key={table}
                    onClick={() => checkTable(table)}
                    className={`px-3 py-1 rounded text-sm ${
                      allTables.includes(table)
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={loading}
                  >
                    {table}
                  </button>
                ))}
              </div>
            </div>

            {/* Resultados */}
            {result && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Resultado:</h3>

                {result.scan ? (
                  <div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
                      <p className="font-semibold text-blue-900">
                        ✅ Encontradas {result.found} tabelas:
                      </p>
                      <ul className="list-disc list-inside mt-2 text-blue-800">
                        {result.tables.map((t: string) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>

                    {result.found === 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-yellow-800">
                          ⚠️ Nenhuma tabela comum encontrada. Possível que o banco esteja
                          vazio ou use nomes diferentes.
                        </p>
                        <p className="text-sm mt-2 text-yellow-700">
                          Tente verificar manualmente ou consulte o Table Editor do Supabase:
                          <br />
                          <a
                            href="https://supabase.com/dashboard/project/tclvrcgoxqsimbqtnyla/editor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            Abrir Table Editor →
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                ) : result.exists ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                      <p className="font-semibold text-green-900">
                        ✅ Tabela "{result.table}" encontrada!
                      </p>
                      <p className="text-green-800 mt-1">
                        Total de registros: {result.count ?? 'N/A'}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Colunas ({result.columns.length}):</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.columns.map((col: string) => (
                          <span
                            key={col}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>

                    {result.sampleData && result.sampleData.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Dados de Exemplo:</h4>
                        <div className="overflow-x-auto">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                            {JSON.stringify(result.sampleData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="font-semibold text-red-900">
                      ❌ Tabela "{result.table}" não encontrada
                    </p>
                    <p className="text-red-800 text-sm mt-1">Erro: {result.error}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Como usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>1. Scan Automático:</strong> Clique no botão para verificar
              automaticamente as tabelas mais comuns.
            </p>
            <p>
              <strong>2. Busca Manual:</strong> Digite o nome exato da tabela e clique em
              "Verificar".
            </p>
            <p>
              <strong>3. Sugestões:</strong> Clique em qualquer tabela sugerida para
              verificá-la rapidamente.
            </p>
            <p className="pt-3 border-t">
              <strong>💡 Dica:</strong> Se nenhuma tabela for encontrada, verifique o Table
              Editor do Supabase para ver os nomes corretos das tabelas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
