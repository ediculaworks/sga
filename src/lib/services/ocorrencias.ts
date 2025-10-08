import { supabase } from '@/lib/supabase/client';
import type {
  Ocorrencia,
  OcorrenciaCompleta,
  OcorrenciaFormData,
  TipoTrabalho,
  TipoAmbulancia
} from '@/types';
import { StatusOcorrencia } from '@/types';

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
