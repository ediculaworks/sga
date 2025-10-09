import { supabase } from '@/lib/supabase/client';
import type {
  Ocorrencia,
  OcorrenciaCompleta,
  OcorrenciaFormData,
  TipoTrabalho,
} from '@/types';
import { StatusOcorrencia, TipoAmbulancia } from '@/types';

/**
 * Serviço de Ocorrências
 * Gerencia operações CRUD e consultas relacionadas a ocorrências
 */

export const ocorrenciasService = {
  /**
   * Busca todas as ocorrências
   */
  async getAll() {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Ocorrencia[];
  },

  /**
   * Busca ocorrências com dados completos (joins)
   */
  async getCompletas() {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select(`
        *,
        ambulancia:ambulancias(*),
        motorista:usuarios!motorista_id(*),
        criador:usuarios!criado_por(*),
        participantes:ocorrencias_participantes(*, usuario:usuarios(*))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OcorrenciaCompleta[];
  },

  /**
   * Busca ocorrências por status
   */
  async getByStatus(status: StatusOcorrencia) {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('status_ocorrencia', status)
      .order('data_ocorrencia', { ascending: false });

    if (error) throw error;
    return data as Ocorrencia[];
  },

  /**
   * Busca ocorrências em aberto
   */
  async getEmAberto() {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('status_ocorrencia', 'EM_ABERTO')
      .order('data_ocorrencia', { ascending: false });

    if (error) throw error;
    return data as Ocorrencia[];
  },

  /**
   * Busca ocorrências por tipo de trabalho
   */
  async getByTipoTrabalho(tipo: TipoTrabalho) {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('tipo_trabalho', tipo)
      .order('data_ocorrencia', { ascending: false });

    if (error) throw error;
    return data as Ocorrencia[];
  },

  /**
   * Busca ocorrências por data
   */
  async getByData(data: string) {
    const { data: ocorrencias, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('data_ocorrencia', data)
      .order('horario_saida');

    if (error) throw error;
    return ocorrencias as Ocorrencia[];
  },

  /**
   * Busca ocorrências por período
   */
  async getByPeriodo(dataInicio: string, dataFim: string) {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .gte('data_ocorrencia', dataInicio)
      .lte('data_ocorrencia', dataFim)
      .order('data_ocorrencia', { ascending: false });

    if (error) throw error;
    return data as Ocorrencia[];
  },

  /**
   * Busca uma ocorrência por ID
   */
  async getById(id: number) {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select(`
        *,
        ambulancia:ambulancias(*),
        motorista:usuarios!motorista_id(*),
        criador:usuarios!criado_por(*),
        participantes:ocorrencias_participantes(*, usuario:usuarios(*))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as OcorrenciaCompleta;
  },

  /**
   * Busca uma ocorrência por número
   */
  async getByNumero(numero: string) {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('numero_ocorrencia', numero)
      .single();

    if (error) throw error;
    return data as Ocorrencia;
  },

  /**
   * Gera próximo número de ocorrência
   */
  async gerarNumeroOcorrencia(): Promise<string> {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const prefixo = `OC${ano}${mes}`;

    const { data, error } = await supabase
      .from('ocorrencias')
      .select('numero_ocorrencia')
      .like('numero_ocorrencia', `${prefixo}%`)
      .order('numero_ocorrencia', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      return `${prefixo}0001`;
    }

    const ultimoNumero = data[0].numero_ocorrencia;
    const sequencial = parseInt(ultimoNumero.slice(-4)) + 1;
    return `${prefixo}${String(sequencial).padStart(4, '0')}`;
  },

  /**
   * Cria uma nova ocorrência
   */
  async create(ocorrencia: OcorrenciaFormData) {
    const numeroOcorrencia = await this.gerarNumeroOcorrencia();

    const { data, error } = await supabase
      .from('ocorrencias')
      .insert([{ ...ocorrencia, numero_ocorrencia: numeroOcorrencia }])
      .select()
      .single();

    if (error) throw error;
    return data as Ocorrencia;
  },

  /**
   * Cria uma nova ocorrência com vagas automáticas
   * Usado pela Central de Despacho (Chefe dos Médicos)
   *
   * Regras de vagas:
   * - BASICA: 1 enfermeiro
   * - EMERGENCIA: 1 médico + 1 enfermeiro
   * - Enfermeiros adicionais conforme especificado
   */
  async createComVagas(
    ocorrenciaData: any,
    quantidade_enfermeiros_adicionais: number = 0,
    criado_por: number
  ) {
    try {
      // 1. Gerar número de ocorrência
      const numeroOcorrencia = await this.gerarNumeroOcorrencia();

      // 2. Preparar dados da ocorrência
      const ocorrenciaParaInserir = {
        numero_ocorrencia: numeroOcorrencia,
        tipo_ambulancia: ocorrenciaData.tipo_ambulancia,
        tipo_trabalho: ocorrenciaData.tipo_trabalho,
        status_ocorrencia: StatusOcorrencia.EM_ABERTO,
        descricao: ocorrenciaData.descricao || null,
        local_ocorrencia: ocorrenciaData.local_ocorrencia,
        endereco_completo: ocorrenciaData.endereco_completo || null,
        data_ocorrencia: ocorrenciaData.data_ocorrencia,
        horario_saida: ocorrenciaData.horario_saida,
        horario_chegada_local: ocorrenciaData.horario_chegada_local,
        horario_termino: ocorrenciaData.horario_termino || null,
        criado_por,
      };

      // 3. Inserir ocorrência
      const { data: ocorrencia, error: ocorrenciaError } = await supabase
        .from('ocorrencias')
        .insert([ocorrenciaParaInserir])
        .select()
        .single();

      if (ocorrenciaError) {
        console.error('Erro ao criar ocorrência:', ocorrenciaError);
        throw new Error('Erro ao criar ocorrência');
      }

      // 4. Criar vagas de participantes baseado no tipo de ambulância
      const vagas: any[] = [];

      if (ocorrenciaData.tipo_ambulancia === TipoAmbulancia.EMERGENCIA) {
        // Ambulância de emergência: 1 médico + 1 enfermeiro (mínimo)
        vagas.push({
          ocorrencia_id: ocorrencia.id,
          funcao: 'MEDICO',
          confirmado: false,
          usuario_id: null,
          valor_pagamento: ocorrenciaData.valor_medico || null,
          data_pagamento: ocorrenciaData.data_pagamento,
          pago: false,
        });

        vagas.push({
          ocorrencia_id: ocorrencia.id,
          funcao: 'ENFERMEIRO',
          confirmado: false,
          usuario_id: null,
          valor_pagamento: ocorrenciaData.valor_enfermeiro || null,
          data_pagamento: ocorrenciaData.data_pagamento,
          pago: false,
        });
      } else {
        // Ambulância básica: apenas 1 enfermeiro (mínimo)
        vagas.push({
          ocorrencia_id: ocorrencia.id,
          funcao: 'ENFERMEIRO',
          confirmado: false,
          usuario_id: null,
          valor_pagamento: ocorrenciaData.valor_enfermeiro || null,
          data_pagamento: ocorrenciaData.data_pagamento,
          pago: false,
        });
      }

      // 5. Adicionar enfermeiros adicionais se especificado
      for (let i = 0; i < quantidade_enfermeiros_adicionais; i++) {
        vagas.push({
          ocorrencia_id: ocorrencia.id,
          funcao: 'ENFERMEIRO',
          confirmado: false,
          usuario_id: null,
          valor_pagamento: ocorrenciaData.valor_enfermeiro || null,
          data_pagamento: ocorrenciaData.data_pagamento,
          pago: false,
        });
      }

      // 6. Inserir todas as vagas
      const { error: vagasError } = await supabase
        .from('ocorrencias_participantes')
        .insert(vagas);

      if (vagasError) {
        console.error('Erro ao criar vagas:', vagasError);
        console.error('Detalhes do erro:', JSON.stringify(vagasError, null, 2));
        console.error('Vagas que tentamos inserir:', JSON.stringify(vagas, null, 2));
        // Tentar deletar a ocorrência criada
        await supabase.from('ocorrencias').delete().eq('id', ocorrencia.id);
        throw new Error(`Erro ao criar vagas da ocorrência: ${vagasError.message || vagasError.code}`);
      }

      return {
        ocorrencia,
        vagas_criadas: vagas.length,
      };
    } catch (error: any) {
      console.error('Erro em createComVagas:', error);
      throw error;
    }
  },

  /**
   * Atualiza uma ocorrência
   */
  async update(id: number, ocorrencia: Partial<OcorrenciaFormData>) {
    const { data, error } = await supabase
      .from('ocorrencias')
      .update(ocorrencia)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ocorrencia;
  },

  /**
   * Atualiza o status de uma ocorrência
   */
  async atualizarStatus(id: number, status: StatusOcorrencia) {
    const updates: any = { status_ocorrencia: status };

    if (status === StatusOcorrencia.EM_ANDAMENTO) {
      updates.data_inicio = new Date().toISOString();
    } else if (status === StatusOcorrencia.CONCLUIDA) {
      updates.data_conclusao = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('ocorrencias')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ocorrencia;
  },

  /**
   * Atribui ambulância e motorista a uma ocorrência
   */
  async atribuirAmbulancia(id: number, ambulanciaId: number, motoristaId: number) {
    const { data, error } = await supabase
      .from('ocorrencias')
      .update({
        ambulancia_id: ambulanciaId,
        motorista_id: motoristaId,
        data_atribuicao: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ocorrencia;
  },

  /**
   * Deleta uma ocorrência
   */
  async delete(id: number) {
    const { error } = await supabase
      .from('ocorrencias')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Confirma participação de um profissional em uma ocorrência
   */
  async confirmarParticipacao(ocorrenciaId: number, usuarioId: number, funcao: string) {
    try {
      // 1. Verificar se o usuário já está participando desta ocorrência
      const { data: participacaoExistente, error: checkError } = await supabase
        .from('ocorrencias_participantes')
        .select('id, confirmado')
        .eq('ocorrencia_id', ocorrenciaId)
        .eq('usuario_id', usuarioId)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar participação existente:', checkError);
        throw new Error('Erro ao verificar participação');
      }

      if (participacaoExistente) {
        if (participacaoExistente.confirmado) {
          throw new Error('Você já confirmou participação nesta ocorrência');
        }
        // Se existe mas não está confirmada, apenas confirmar
        const { data: participante, error: updateError } = await supabase
          .from('ocorrencias_participantes')
          .update({
            confirmado: true,
            data_confirmacao: new Date().toISOString(),
          })
          .eq('id', participacaoExistente.id)
          .select()
          .single();

        if (updateError) {
          console.error('Erro ao confirmar participação existente:', updateError);
          throw updateError;
        }

        return participante;
      }

      // 2. Buscar uma vaga em aberto para este perfil (usuario_id NULL)
      const { data: vagasDisponiveis, error: vagaError } = await supabase
        .from('ocorrencias_participantes')
        .select('id')
        .eq('ocorrencia_id', ocorrenciaId)
        .eq('funcao', funcao)
        .eq('confirmado', false)
        .is('usuario_id', null)
        .limit(1);

      if (vagaError) {
        console.error('Erro ao buscar vagas disponíveis:', vagaError);
        throw new Error('Erro ao buscar vagas disponíveis');
      }

      if (!vagasDisponiveis || vagasDisponiveis.length === 0) {
        throw new Error('Nenhuma vaga disponível para este perfil');
      }

      const vagaDisponivel = vagasDisponiveis[0];

      // 3. Atualizar a vaga com os dados do profissional
      const { data: participante, error: updateError } = await supabase
        .from('ocorrencias_participantes')
        .update({
          usuario_id: usuarioId,
          confirmado: true,
          data_confirmacao: new Date().toISOString(),
        })
        .eq('id', vagaDisponivel.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar vaga:', updateError);
        throw updateError;
      }

      // 4. Verificar se todas as vagas foram preenchidas
      const { data: todasVagas, error: vagasError } = await supabase
        .from('ocorrencias_participantes')
        .select('confirmado')
        .eq('ocorrencia_id', ocorrenciaId);

      if (vagasError) {
        console.error('Erro ao verificar vagas:', vagasError);
        // Não falhar aqui, pois a confirmação já foi feita
      } else {
        // 5. Se todas as vagas estiverem confirmadas, mudar status para CONFIRMADA
        const todasConfirmadas = todasVagas?.every((v) => v.confirmado) ?? false;

        if (todasConfirmadas) {
          await this.atualizarStatus(ocorrenciaId, StatusOcorrencia.CONFIRMADA);
        }
      }

      return participante;
    } catch (error: any) {
      console.error('Erro em confirmarParticipacao:', error);
      throw error;
    }
  }
};
