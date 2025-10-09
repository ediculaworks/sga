'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency, formatLabel } from '@/lib/utils/formatters';
import { getBadgeColor } from '@/lib/utils/styles';
import {
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  Ambulance,
  Briefcase,
  Users,
  X,
  FileText,
  User,
} from 'lucide-react';
import { TipoPerfil } from '@/types';
import { AdicionarNotaModal } from '@/components/enfermeiro/AdicionarNotaModal';

interface OcorrenciaDetalhesModalProps {
  ocorrenciaId: number | null;
  isOpen: boolean;
  onClose: () => void;
  perfil?: TipoPerfil;
  onConfirmarParticipacao?: (ocorrenciaId: number) => void;
  isConfirmando?: boolean;
}

interface OcorrenciaDetalhes {
  id: number;
  numero_ocorrencia: string;
  tipo_ambulancia: string;
  tipo_trabalho: string;
  status_ocorrencia: string;
  descricao?: string;
  local_ocorrencia: string;
  endereco_completo?: string;
  data_ocorrencia: string;
  horario_saida: string;
  horario_chegada_local?: string;
  horario_termino?: string;
  participantes: Participante[];
  ambulancia_id?: number | null;
  ambulancia?: {
    placa: string;
    modelo: string;
  } | null;
  motorista_id?: number | null;
  motorista?: {
    nome_completo: string;
  } | null;
  duracao_total?: number | null;
  carga_horaria?: number | null;
  data_inicio?: string | null;
  data_conclusao?: string | null;
}

interface Participante {
  id: number;
  usuario_id: number | null;
  funcao: string;
  valor_pagamento?: number;
  data_pagamento?: string;
  confirmado: boolean;
  usuario?: {
    nome_completo: string;
  };
}

interface PacienteAtendido {
  id: number;
  nome_completo: string;
  idade?: number;
  sexo?: string;
  queixa_principal?: string;
  quadro_clinico?: string;
}

interface ConsumoMaterial {
  id: number;
  quantidade_utilizada: number;
  equipamento: {
    nome: string;
    unidade_medida?: string;
  };
}

export function OcorrenciaDetalhesModal({
  ocorrenciaId,
  isOpen,
  onClose,
  perfil,
  onConfirmarParticipacao,
  isConfirmando = false,
}: OcorrenciaDetalhesModalProps) {
  // Estados para modal de adicionar nota
  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<{
    atendimentoId: number;
    nome: string;
  } | null>(null);

  // Estados para modal de enviar aviso
  const [isAvisoModalOpen, setIsAvisoModalOpen] = useState(false);
  const [avisoTexto, setAvisoTexto] = useState('');
  const [isEnviandoAviso, setIsEnviandoAviso] = useState(false);

  // Estado para armazenar ID do usuário logado
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(null);

  // Buscar ID do usuário logado
  useEffect(() => {
    const fetchUsuarioLogado = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (usuario) {
          setUsuarioLogadoId(usuario.id);
        }
      }
    };

    if (isOpen) {
      fetchUsuarioLogado();
    }
  }, [isOpen]);

  const { data: ocorrencia, isLoading } = useQuery({
    queryKey: ['ocorrencia-detalhes', ocorrenciaId],
    queryFn: async (): Promise<OcorrenciaDetalhes | null> => {
      if (!ocorrenciaId) return null;

      const { data, error } = await supabase
        .from('ocorrencias')
        .select(
          `
          id,
          numero_ocorrencia,
          tipo_ambulancia,
          tipo_trabalho,
          status_ocorrencia,
          descricao,
          local_ocorrencia,
          endereco_completo,
          data_ocorrencia,
          horario_saida,
          horario_chegada_local,
          horario_termino,
          ambulancia_id,
          ambulancia:ambulancias(placa, modelo),
          motorista_id,
          motorista:usuarios!ocorrencias_motorista_id_fkey(nome_completo),
          duracao_total,
          carga_horaria,
          data_inicio,
          data_conclusao,
          participantes:ocorrencias_participantes(
            id,
            usuario_id,
            funcao,
            valor_pagamento,
            data_pagamento,
            confirmado,
            usuario:usuarios(nome_completo)
          )
        `
        )
        .eq('id', ocorrenciaId)
        .single();

      if (error) {
        console.error('Erro ao buscar detalhes da ocorrência:', error);
        throw error;
      }

      return data as unknown as OcorrenciaDetalhes;
    },
    enabled: isOpen && !!ocorrenciaId,
    staleTime: 1000 * 60 * 3, // 3 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  // Query para buscar pacientes atendidos na ocorrência (apenas para enfermeiro em ocorrência EM_ANDAMENTO)
  const { data: pacientes, refetch: refetchPacientes } = useQuery({
    queryKey: ['pacientes-ocorrencia', ocorrenciaId],
    queryFn: async (): Promise<PacienteAtendido[]> => {
      if (!ocorrenciaId) return [];

      const { data, error } = await supabase
        .from('atendimentos')
        .select(
          `
          id,
          queixa_principal,
          pacientes (
            nome_completo,
            idade,
            sexo
          )
        `
        )
        .eq('ocorrencia_id', ocorrenciaId);

      if (error) {
        console.error('Erro ao buscar pacientes:', error);
        return [];
      }

      return (data || []).map((atendimento: any) => ({
        id: atendimento.id,
        nome_completo: atendimento.pacientes?.nome_completo || 'Paciente sem nome',
        idade: atendimento.pacientes?.idade,
        sexo: atendimento.pacientes?.sexo,
        queixa_principal: atendimento.queixa_principal,
      }));
    },
    enabled:
      isOpen &&
      !!ocorrenciaId &&
      perfil === TipoPerfil.ENFERMEIRO &&
      ocorrencia?.status_ocorrencia === 'EM_ANDAMENTO',
    staleTime: 1000 * 60 * 3, // 3 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  // Query para buscar pacientes concluídos (status CONCLUIDA)
  const { data: pacientesConcluidos } = useQuery({
    queryKey: ['pacientes-concluidos', ocorrenciaId],
    queryFn: async (): Promise<PacienteAtendido[]> => {
      if (!ocorrenciaId) return [];

      const { data, error } = await supabase
        .from('atendimentos')
        .select(
          `
          id,
          queixa_principal,
          quadro_clinico,
          pacientes (
            nome_completo,
            idade,
            sexo
          )
        `
        )
        .eq('ocorrencia_id', ocorrenciaId);

      if (error) {
        console.error('Erro ao buscar pacientes concluídos:', error);
        return [];
      }

      return (data || []).map((atendimento: any) => ({
        id: atendimento.id,
        nome_completo: atendimento.pacientes?.nome_completo || 'Paciente sem nome',
        idade: atendimento.pacientes?.idade,
        sexo: atendimento.pacientes?.sexo,
        queixa_principal: atendimento.queixa_principal,
        quadro_clinico: atendimento.quadro_clinico,
      }));
    },
    enabled:
      isOpen && !!ocorrenciaId && ocorrencia?.status_ocorrencia === 'CONCLUIDA',
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 15, // 15 minutos
  });

  // Query para buscar consumo de materiais (status CONCLUIDA)
  const { data: consumoMateriais } = useQuery({
    queryKey: ['consumo-materiais', ocorrenciaId],
    queryFn: async (): Promise<ConsumoMaterial[]> => {
      if (!ocorrenciaId) return [];

      const { data, error } = await supabase
        .from('consumo_materiais')
        .select(
          `
          id,
          quantidade_utilizada,
          equipamento:equipamentos_catalogo(nome, unidade_medida)
        `
        )
        .eq('ocorrencia_id', ocorrenciaId);

      if (error) {
        console.error('Erro ao buscar consumo de materiais:', error);
        return [];
      }

      return (data || []).map((consumo: any) => ({
        id: consumo.id,
        quantidade_utilizada: consumo.quantidade_utilizada,
        equipamento: consumo.equipamento || { nome: 'Desconhecido', unidade_medida: 'un' },
      }));
    },
    enabled:
      isOpen && !!ocorrenciaId && ocorrencia?.status_ocorrencia === 'CONCLUIDA',
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 15, // 15 minutos
  });

  // Função para salvar nota de enfermeiro
  const handleSalvarNota = async (atendimentoId: number, nota: string) => {
    try {
      // Buscar ID do enfermeiro logado
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (userError || !usuario) {
        throw new Error('Usuário não encontrado');
      }

      // Inserir nota
      const { error } = await supabase.from('notas_enfermeiro_pacientes').insert({
        atendimento_id: atendimentoId,
        enfermeiro_id: usuario.id,
        nota: nota,
      });

      if (error) throw error;

      // Fechar modal e recarregar lista
      setIsNotaModalOpen(false);
      setPacienteSelecionado(null);
      await refetchPacientes();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      throw error;
    }
  };

  // Função para abrir modal de adicionar nota
  const handleAdicionarNota = (atendimentoId: number, nome: string) => {
    setPacienteSelecionado({ atendimentoId, nome });
    setIsNotaModalOpen(true);
  };

  // Função para enviar aviso (FASE 8.2 - Chefe dos Médicos)
  const handleEnviarAviso = async () => {
    if (!avisoTexto.trim() || !ocorrenciaId || !ocorrencia) return;

    setIsEnviandoAviso(true);
    try {
      // Buscar ID do usuário logado (Chefe dos Médicos)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (userError || !usuario) {
        throw new Error('Usuário não encontrado');
      }

      // Buscar todos os participantes da ocorrência
      const participantesIds = ocorrencia.participantes
        .filter((p) => p.usuario_id)
        .map((p) => p.usuario_id);

      // Criar notificação para cada participante
      const notificacoes = participantesIds.map((destinatarioId) => ({
        remetente_id: usuario.id,
        destinatario_id: destinatarioId,
        ocorrencia_id: ocorrenciaId,
        tipo_notificacao: 'AVISO_OCORRENCIA',
        titulo: `Aviso - Ocorrência ${ocorrencia.numero_ocorrencia}`,
        mensagem: avisoTexto,
        lida: false,
      }));

      const { error } = await supabase.from('notificacoes').insert(notificacoes);

      if (error) throw error;

      // Limpar e fechar modal
      setAvisoTexto('');
      setIsAvisoModalOpen(false);

      // Toast de sucesso (você pode adicionar toast aqui se quiser)
      alert(`Aviso enviado para ${participantesIds.length} participante(s)!`);
    } catch (error) {
      console.error('Erro ao enviar aviso:', error);
      alert('Erro ao enviar aviso. Tente novamente.');
    } finally {
      setIsEnviandoAviso(false);
    }
  };

  if (!isOpen) return null;

  // Verificar se há vaga disponível para o perfil do usuário
  const participantes = ocorrencia?.participantes || [];
  const vagasParaPerfil = participantes.filter((p) => p.funcao === perfil);
  const vagasDisponiveis = vagasParaPerfil.filter((p) => !p.confirmado);
  const podeConfirmar =
    ocorrencia?.status_ocorrencia === 'EM_ABERTO' &&
    vagasDisponiveis.length > 0 &&
    perfil &&
    onConfirmarParticipacao;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Detalhes da Ocorrência
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : ocorrencia ? (
          <div className="space-y-6 w-full max-w-full overflow-hidden">
            {/* Número da Ocorrência */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">
                Número da Ocorrência
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {ocorrencia.numero_ocorrencia}
              </p>
            </div>

            {/* Tipos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Tipo de Trabalho
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getBadgeColor(
                    'tipo_trabalho',
                    ocorrencia.tipo_trabalho
                  )}`}
                >
                  {formatLabel(ocorrencia.tipo_trabalho)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Tipo de Ambulância
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getBadgeColor(
                    'tipo_ambulancia',
                    ocorrencia.tipo_ambulancia
                  )}`}
                >
                  <Ambulance className="w-4 h-4 mr-1" />
                  {formatLabel(ocorrencia.tipo_ambulancia)}
                </span>
              </div>
            </div>

            {/* Descrição */}
            {ocorrencia.descricao && (
              <div className="w-full">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Descrição
                </p>
                <div className="text-gray-900 bg-gray-50 p-3 rounded-lg border w-full overflow-hidden">
                  <p className="whitespace-pre-wrap break-words w-full">
                    {ocorrencia.descricao}
                  </p>
                </div>
              </div>
            )}

            {/* Local */}
            <div className="w-full overflow-hidden">
              <p className="text-sm text-gray-600 mb-2 font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Local da Ocorrência
              </p>
              <p className="text-gray-900 font-medium break-words w-full">
                {ocorrencia.local_ocorrencia}
              </p>
              {ocorrencia.endereco_completo && (
                <p className="text-gray-600 text-sm mt-1 break-words w-full">
                  {ocorrencia.endereco_completo}
                </p>
              )}
            </div>

            {/* Data e Horários */}
            <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Data:</span>
                <span className="font-medium text-gray-900">
                  {format(new Date(ocorrencia.data_ocorrencia + 'T00:00:00'), 'PPP', {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Horário de Saída:</span>
                <span className="font-medium text-gray-900">
                  {ocorrencia.horario_saida}
                </span>
              </div>
              {ocorrencia.horario_chegada_local && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    Horário no Local:
                  </span>
                  <span className="font-medium text-gray-900">
                    {ocorrencia.horario_chegada_local}
                  </span>
                </div>
              )}
              {ocorrencia.horario_termino && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    Horário de Término:
                  </span>
                  <span className="font-medium text-gray-900">
                    {ocorrencia.horario_termino}
                  </span>
                </div>
              )}
              {ocorrencia.carga_horaria && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Carga Horária:</span>
                  <span className="font-medium text-gray-900">
                    {ocorrencia.carga_horaria} horas
                  </span>
                </div>
              )}
            </div>

            {/* Informações da Ambulância e Motorista - Para status CONFIRMADA, EM_ANDAMENTO e CONCLUIDA */}
            {(ocorrencia.status_ocorrencia === 'CONFIRMADA' ||
              ocorrencia.status_ocorrencia === 'EM_ANDAMENTO' ||
              ocorrencia.status_ocorrencia === 'CONCLUIDA') &&
              ocorrencia.ambulancia && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-gray-600 mb-3 font-medium flex items-center gap-1">
                    <Ambulance className="w-4 h-4" />
                    Ambulância Atribuída
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Placa:</span>
                    <span className="font-bold text-purple-900 text-lg">
                      {ocorrencia.ambulancia.placa}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Modelo:</span>
                    <span className="font-medium text-gray-900">
                      {ocorrencia.ambulancia.modelo}
                    </span>
                  </div>
                  {ocorrencia.motorista && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Motorista:</span>
                      <span className="font-medium text-gray-900">
                        {ocorrencia.motorista.nome_completo}
                      </span>
                    </div>
                  )}
                </div>
              )}

            {/* Duração Total - Apenas para status CONCLUIDA */}
            {ocorrencia.status_ocorrencia === 'CONCLUIDA' &&
              ocorrencia.duracao_total && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duração Total da Operação
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.floor(ocorrencia.duracao_total / 60)}h {ocorrencia.duracao_total % 60}min
                  </p>
                  {ocorrencia.data_inicio && (
                    <p className="text-xs text-gray-600 mt-2">
                      Início:{' '}
                      {format(new Date(ocorrencia.data_inicio), 'dd/MM/yyyy HH:mm')}
                    </p>
                  )}
                  {ocorrencia.data_conclusao && (
                    <p className="text-xs text-gray-600">
                      Conclusão:{' '}
                      {format(new Date(ocorrencia.data_conclusao), 'dd/MM/yyyy HH:mm')}
                    </p>
                  )}
                </div>
              )}

            {/* Participantes/Vagas */}
            <div className="w-full">
              <p className="text-sm text-gray-600 mb-3 font-medium flex items-center gap-1">
                <Users className="w-4 h-4" />
                Equipe / Vagas
              </p>
              <div className="space-y-2">
                {participantes.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg w-full overflow-hidden"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-700 flex-shrink-0">
                        {formatLabel(p.funcao)}
                      </span>
                      {p.confirmado && p.usuario ? (
                        <>
                          <span className="text-gray-600 flex-shrink-0">-</span>
                          <span className="text-sm text-gray-900 truncate">
                            {p.usuario.nome_completo}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getBadgeColor(
                        'status',
                        p.confirmado ? 'confirmado' : 'disponivel'
                      )}`}
                    >
                      {p.confirmado ? 'Confirmado' : 'Disponível'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pacientes Atendidos - Apenas para status CONCLUIDA */}
            {ocorrencia.status_ocorrencia === 'CONCLUIDA' &&
              pacientesConcluidos &&
              pacientesConcluidos.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3 font-medium flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Pacientes Atendidos ({pacientesConcluidos.length})
                  </p>
                  <div className="space-y-2">
                    {pacientesConcluidos.map((paciente) => (
                      <div
                        key={paciente.id}
                        className="p-3 bg-white border rounded-lg"
                      >
                        <p className="font-medium text-gray-900">
                          {paciente.nome_completo}
                        </p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          {paciente.idade && <span>Idade: {paciente.idade} anos</span>}
                          {paciente.sexo && <span>Sexo: {paciente.sexo}</span>}
                        </div>
                        {paciente.queixa_principal && (
                          <p className="text-xs text-gray-600 mt-2">
                            <span className="font-medium">Queixa:</span> {paciente.queixa_principal}
                          </p>
                        )}
                        {paciente.quadro_clinico && (
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Quadro Clínico:</span> {paciente.quadro_clinico}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Consumo de Materiais - Apenas para status CONCLUIDA */}
            {ocorrencia.status_ocorrencia === 'CONCLUIDA' &&
              consumoMateriais &&
              consumoMateriais.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3 font-medium flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Consumo de Materiais ({consumoMateriais.length} itens)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {consumoMateriais.map((consumo) => (
                      <div
                        key={consumo.id}
                        className="p-2 bg-white border rounded text-sm"
                      >
                        <p className="font-medium text-gray-900 text-xs">
                          {consumo.equipamento.nome}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Qtd: {consumo.quantidade_utilizada}{' '}
                          {consumo.equipamento.unidade_medida || 'un'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Informações de Pagamento */}
            {/* Chefe dos Médicos vê todos os valores | Profissionais veem apenas seu próprio valor */}
            {participantes.some((p) => p.valor_pagamento) && (
              perfil === 'CHEFE_MEDICOS' ||
              participantes.some((p) => p.valor_pagamento && p.usuario_id === usuarioLogadoId)
            ) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-3 font-medium flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Informações de Pagamento
                  {perfil === 'CHEFE_MEDICOS' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Visão Completa
                    </span>
                  )}
                </p>
                <div className="space-y-2">
                  {participantes
                    .filter((p) =>
                      p.valor_pagamento &&
                      (perfil === 'CHEFE_MEDICOS' || p.usuario_id === usuarioLogadoId)
                    )
                    .map((p) => (
                      <div key={p.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {formatLabel(p.funcao)}
                          {p.usuario && perfil === 'CHEFE_MEDICOS' && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({p.usuario.nome_completo})
                            </span>
                          )}:
                        </span>
                        <div className="text-right">
                          <span className="font-semibold text-green-800">
                            {formatCurrency(p.valor_pagamento || 0)}
                          </span>
                          {p.data_pagamento && (
                            <span className="block text-xs text-gray-600">
                              Pagamento em:{' '}
                              {format(new Date(p.data_pagamento), 'dd/MM/yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
                {perfil === 'CHEFE_MEDICOS' && participantes.filter(p => p.valor_pagamento).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-300 flex justify-between text-sm font-bold">
                    <span className="text-gray-700">Total:</span>
                    <span className="text-green-900">
                      {formatCurrency(
                        participantes.reduce((acc, p) => acc + (p.valor_pagamento || 0), 0)
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Lista de Pacientes Atendidos - FASE 6.2 - Apenas para ENFERMEIRO em ocorrência EM_ANDAMENTO */}
            {perfil === TipoPerfil.ENFERMEIRO &&
              ocorrencia.status_ocorrencia === 'EM_ANDAMENTO' &&
              pacientes &&
              pacientes.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3 font-medium flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Pacientes Atendidos nesta Ocorrência
                  </p>
                  <div className="space-y-2">
                    {pacientes.map((paciente) => (
                      <div
                        key={paciente.id}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {paciente.nome_completo}
                          </p>
                          {paciente.queixa_principal && (
                            <p className="text-xs text-gray-600 mt-1">
                              Queixa: {paciente.queixa_principal}
                            </p>
                          )}
                          <div className="flex gap-3 mt-1 text-xs text-gray-500">
                            {paciente.idade && <span>Idade: {paciente.idade} anos</span>}
                            {paciente.sexo && <span>Sexo: {paciente.sexo}</span>}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleAdicionarNota(paciente.id, paciente.nome_completo)
                          }
                          className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Adicionar Nota
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            Ocorrência não encontrada
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isConfirmando}>
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
          {/* Botão Enviar Aviso - FASE 8.2 - Apenas Chefe dos Médicos em status EM_ANDAMENTO */}
          {perfil === 'CHEFE_MEDICOS' &&
            ocorrencia?.status_ocorrencia === 'EM_ANDAMENTO' && (
              <Button
                onClick={() => setIsAvisoModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Enviar Aviso
              </Button>
            )}
          {podeConfirmar && ocorrenciaId && (
            <Button
              onClick={() => onConfirmarParticipacao(ocorrenciaId)}
              disabled={isConfirmando}
              className="bg-green-600 hover:bg-green-700"
            >
              {isConfirmando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirmando...
                </>
              ) : (
                'Confirmar Participação'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Modal de Enviar Aviso - FASE 8.2 */}
      <Dialog open={isAvisoModalOpen} onOpenChange={setIsAvisoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Aviso para Equipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Envie um aviso importante para todos os participantes desta ocorrência.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Mensagem do Aviso
              </label>
              <textarea
                value={avisoTexto}
                onChange={(e) => setAvisoTexto(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                disabled={isEnviandoAviso}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAvisoModalOpen(false);
                setAvisoTexto('');
              }}
              disabled={isEnviandoAviso}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnviarAviso}
              disabled={!avisoTexto.trim() || isEnviandoAviso}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isEnviandoAviso ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Aviso'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Nota - FASE 6.2 */}
      {pacienteSelecionado && (
        <AdicionarNotaModal
          atendimentoId={pacienteSelecionado.atendimentoId}
          pacienteNome={pacienteSelecionado.nome}
          isOpen={isNotaModalOpen}
          onClose={() => {
            setIsNotaModalOpen(false);
            setPacienteSelecionado(null);
          }}
          onSalvarNota={handleSalvarNota}
        />
      )}
    </Dialog>
  );
}
