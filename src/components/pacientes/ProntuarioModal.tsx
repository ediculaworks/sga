'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProntuarioModalProps {
  atendimentoId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProntuarioModal({
  atendimentoId,
  isOpen,
  onClose,
}: ProntuarioModalProps) {
  // Buscar dados completos do atendimento
  const { data: atendimento, isLoading: loadingAtendimento } = useQuery({
    queryKey: ['atendimento', atendimentoId],
    queryFn: async () => {
      if (!atendimentoId) return null;

      const { data, error } = await supabase
        .from('atendimentos')
        .select(
          `
          *,
          pacientes (
            nome_completo,
            idade,
            sexo
          ),
          ocorrencias (
            numero_ocorrencia,
            data_ocorrencia,
            local_ocorrencia,
            tipo_trabalho
          ),
          usuarios!atendimentos_medico_id_fkey (
            nome_completo
          )
        `
        )
        .eq('id', atendimentoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!atendimentoId && isOpen,
  });

  // Buscar arquivos do atendimento
  const { data: arquivos, isLoading: loadingArquivos } = useQuery({
    queryKey: ['atendimento-arquivos', atendimentoId],
    queryFn: async () => {
      if (!atendimentoId) return [];

      const { data, error } = await supabase
        .from('atendimentos_arquivos')
        .select('*')
        .eq('atendimento_id', atendimentoId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!atendimentoId && isOpen,
  });

  // Buscar notas de enfermeiro
  const { data: notasEnfermeiro, isLoading: loadingNotas } = useQuery({
    queryKey: ['notas-enfermeiro', atendimentoId],
    queryFn: async () => {
      if (!atendimentoId) return [];

      const { data, error } = await supabase
        .from('notas_enfermeiro_pacientes')
        .select(
          `
          *,
          usuarios!notas_enfermeiro_pacientes_enfermeiro_id_fkey (
            nome_completo
          )
        `
        )
        .eq('atendimento_id', atendimentoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!atendimentoId && isOpen,
  });

  const isLoading = loadingAtendimento || loadingArquivos || loadingNotas;

  const downloadArquivo = async (caminhoArquivo: string, nomeArquivo: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('atendimentos')
        .download(caminhoArquivo);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Prontuário Completo</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando prontuário...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações do Atendimento */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações do Atendimento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Paciente
                  </label>
                  <p className="text-base text-gray-900">
                    {atendimento?.pacientes?.nome_completo}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Data do Atendimento
                  </label>
                  <p className="text-base text-gray-900">
                    {atendimento?.data_atendimento
                      ? format(
                          new Date(atendimento.data_atendimento),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )
                      : '-'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ocorrência
                  </label>
                  <p className="text-base text-gray-900">
                    {atendimento?.ocorrencias?.numero_ocorrencia || '-'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Médico Responsável
                  </label>
                  <p className="text-base text-gray-900">
                    {atendimento?.usuarios?.nome_completo || '-'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Local da Ocorrência
                  </label>
                  <p className="text-base text-gray-900">
                    {atendimento?.ocorrencias?.local_ocorrencia || '-'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Dados Clínicos */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dados Clínicos
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Queixa Principal
                  </label>
                  <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
                    {atendimento?.queixa_principal || '-'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Quadro Clínico
                  </label>
                  <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
                    {atendimento?.quadro_clinico || '-'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Procedimentos Realizados
                  </label>
                  <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
                    {atendimento?.procedimentos_realizados || '-'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Diagnóstico
                  </label>
                  <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
                    {atendimento?.diagnostico || '-'}
                  </p>
                </div>

                {atendimento?.remocao && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Hospital Destino (Remoção)
                    </label>
                    <p className="text-base text-gray-900 mt-1">
                      {atendimento?.hospital_destino || '-'}
                    </p>
                  </div>
                )}

                {atendimento?.observacoes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Observações
                    </label>
                    <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
                      {atendimento.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Notas de Enfermagem */}
            {notasEnfermeiro && notasEnfermeiro.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notas de Enfermagem
                </h3>
                <div className="space-y-4">
                  {notasEnfermeiro.map((nota: any) => (
                    <div key={nota.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {nota.usuarios?.nome_completo}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(
                            new Date(nota.created_at),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {nota.nota}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Arquivos Anexados */}
            {arquivos && arquivos.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Arquivos Anexados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {arquivos.map((arquivo: any) => (
                    <div
                      key={arquivo.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        downloadArquivo(
                          arquivo.caminho_arquivo,
                          arquivo.nome_arquivo
                        )
                      }
                    >
                      {arquivo.tipo_arquivo.startsWith('image/') ? (
                        <ImageIcon className="h-8 w-8 text-blue-600" />
                      ) : (
                        <FileText className="h-8 w-8 text-gray-600" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {arquivo.nome_arquivo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {arquivo.tamanho_bytes
                            ? `${(arquivo.tamanho_bytes / 1024).toFixed(1)} KB`
                            : '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
