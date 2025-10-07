import { supabase } from '@/lib/supabase/client';
import type {
  Ocorrencia,
  OcorrenciaCompleta,
  OcorrenciaFormData,
  StatusOcorrencia,
  TipoTrabalho,
  TipoAmbulancia
} from '@/types';

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

    if (status === 'EM_ANDAMENTO') {
      updates.data_inicio = new Date().toISOString();
    } else if (status === 'CONCLUIDA') {
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
  }
};
