'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Calendar, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PacienteHistoricoModalProps {
  pacienteId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onVerProntuario?: (atendimentoId: number) => void;
}

export function PacienteHistoricoModal({
  pacienteId,
  isOpen,
  onClose,
  onVerProntuario,
}: PacienteHistoricoModalProps) {
  // Buscar dados do paciente
  const { data: paciente, isLoading: loadingPaciente } = useQuery({
    queryKey: ['paciente', pacienteId],
    queryFn: async () => {
      if (!pacienteId) return null;

      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!pacienteId && isOpen,
  });

  // Buscar atendimentos do paciente
  const { data: atendimentos, isLoading: loadingAtendimentos } = useQuery({
    queryKey: ['atendimentos-paciente', pacienteId],
    queryFn: async () => {
      if (!pacienteId) return [];

      const { data, error } = await supabase
        .from('atendimentos')
        .select(
          `
          id,
          data_atendimento,
          queixa_principal,
          remocao,
          hospital_destino,
          ocorrencia_id,
          medico_id,
          ocorrencias (
            numero_ocorrencia,
            local_ocorrencia
          ),
          usuarios!atendimentos_medico_id_fkey (
            nome_completo
          )
        `
        )
        .eq('paciente_id', pacienteId)
        .order('data_atendimento', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!pacienteId && isOpen,
  });

  const isLoading = loadingPaciente || loadingAtendimentos;

  const calcularIdade = (dataNascimento?: string) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Histórico do Paciente</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando dados...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações Pessoais */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nome Completo
                  </label>
                  <p className="text-base text-gray-900">
                    {paciente?.nome_completo}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    CPF
                  </label>
                  <p className="text-base text-gray-900">
                    {paciente?.cpf || '-'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Data de Nascimento
                  </label>
                  <p className="text-base text-gray-900">
                    {paciente?.data_nascimento
                      ? format(
                          new Date(paciente.data_nascimento),
                          'dd/MM/yyyy',
                          { locale: ptBR }
                        )
                      : '-'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Idade
                  </label>
                  <p className="text-base text-gray-900">
                    {paciente?.idade ||
                      calcularIdade(paciente?.data_nascimento) ||
                      '-'}{' '}
                    anos
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Sexo
                  </label>
                  <p className="text-base text-gray-900">
                    {paciente?.sexo === 'M'
                      ? 'Masculino'
                      : paciente?.sexo === 'F'
                      ? 'Feminino'
                      : '-'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Telefone
                  </label>
                  <p className="text-base text-gray-900">
                    {paciente?.telefone || '-'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Endereço
                  </label>
                  <p className="text-base text-gray-900">
                    {paciente?.endereco_completo || '-'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Contato de Emergência
                  </label>
                  <p className="text-base text-gray-900">
                    {paciente?.contato_emergencia || '-'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Telefone de Emergência
                  </label>
                  <p className="text-base text-gray-900">
                    {paciente?.telefone_emergencia || '-'}
                  </p>
                </div>

                {paciente?.observacoes_gerais && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Observações Gerais
                    </label>
                    <p className="text-base text-gray-900">
                      {paciente.observacoes_gerais}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Lista de Atendimentos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Histórico de Atendimentos ({atendimentos?.length || 0})
              </h3>

              {!atendimentos || atendimentos.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">
                    Nenhum atendimento registrado para este paciente.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {atendimentos.map((atendimento: any) => (
                    <Card key={atendimento.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {format(
                                  new Date(atendimento.data_atendimento),
                                  "dd/MM/yyyy 'às' HH:mm",
                                  { locale: ptBR }
                                )}
                              </span>
                            </div>

                            {atendimento.remocao && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Remoção
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Ocorrência:{' '}
                              {atendimento.ocorrencias?.numero_ocorrencia ||
                                '-'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {atendimento.ocorrencias?.local_ocorrencia || '-'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Médico:{' '}
                              {atendimento.usuarios?.nome_completo || '-'}
                            </span>
                          </div>

                          {atendimento.queixa_principal && (
                            <div className="mt-2">
                              <label className="text-xs font-medium text-gray-500">
                                Queixa Principal:
                              </label>
                              <p className="text-sm text-gray-900 mt-1">
                                {atendimento.queixa_principal}
                              </p>
                            </div>
                          )}

                          {atendimento.remocao &&
                            atendimento.hospital_destino && (
                              <div className="mt-2">
                                <label className="text-xs font-medium text-gray-500">
                                  Hospital Destino:
                                </label>
                                <p className="text-sm text-gray-900 mt-1">
                                  {atendimento.hospital_destino}
                                </p>
                              </div>
                            )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onVerProntuario?.(atendimento.id)}
                        >
                          Ver Prontuário
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
