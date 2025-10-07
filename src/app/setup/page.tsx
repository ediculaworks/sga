'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SetupPage() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    if (!url || !key) {
      setStatus('error');
      setMessage('Por favor, preencha URL e Chave');
      return;
    }

    setStatus('testing');
    setMessage('Testando conexão...');

    try {
      const response = await fetch('/api/test-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, key }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        let msg = `✅ ${data.message || 'Conexão bem-sucedida!'}`;
        if (data.details) {
          msg += `\n${data.details}`;
        }
        setMessage(msg);
      } else {
        setStatus('error');
        setMessage(`❌ Erro: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Erro ao testar: ${error.message || error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>🚑 Configuração do Supabase</CardTitle>
          <CardDescription>
            Configure as credenciais do Supabase para conectar ao banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL do Projeto Supabase</Label>
              <Input
                id="url"
                placeholder="https://xxxxxxxxxxx.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Exemplo: https://abcdefghijk.supabase.co
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">Chave Anônima (anon/public)</Label>
              <Input
                id="key"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                ⚠️ Use a chave "anon public", NÃO a "service_role"
              </p>
            </div>

            <Button onClick={testConnection} disabled={status === 'testing'} className="w-full">
              {status === 'testing' ? 'Testando...' : 'Testar Conexão'}
            </Button>

            {message && (
              <div
                className={`p-4 rounded-lg whitespace-pre-wrap ${
                  status === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : status === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                {message}
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">📝 Como obter suas credenciais:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>
                Acesse{' '}
                <a
                  href="https://app.supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  app.supabase.com
                </a>
              </li>
              <li>Faça login ou crie uma conta</li>
              <li>Crie um novo projeto ou selecione um existente</li>
              <li>Vá em Settings → API</li>
              <li>Copie a "Project URL" e cole no campo URL acima</li>
              <li>Copie a "anon/public" key e cole no campo Chave acima</li>
              <li>Clique em "Testar Conexão"</li>
            </ol>
          </div>

          {status === 'success' && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">✅ Próximos passos:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Copie as variáveis abaixo para o arquivo <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
                <li>Reinicie o servidor (Ctrl+C e depois <code className="bg-gray-100 px-1 rounded">npm run dev</code>)</li>
                <li>Execute o script SQL em <code className="bg-gray-100 px-1 rounded">supabase/schema.sql</code> no SQL Editor do Supabase</li>
                <li>Acesse a página inicial do sistema</li>
              </ol>
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <p className="text-xs font-mono whitespace-pre">
                  NEXT_PUBLIC_SUPABASE_URL={url}
                  {'\n'}NEXT_PUBLIC_SUPABASE_ANON_KEY={key}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3 text-red-700">🔍 Dicas de Solução:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Verifique se a URL está no formato: <code className="bg-gray-100 px-1 rounded">https://xxxxxxx.supabase.co</code></li>
                <li>Confirme que copiou a chave <strong>anon/public</strong>, não a service_role</li>
                <li>Verifique se não há espaços extras ao colar as credenciais</li>
                <li>Certifique-se de que o projeto Supabase está ativo (não pausado)</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
