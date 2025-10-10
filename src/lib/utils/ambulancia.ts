/**
 * Utilitários para lógica de ambulâncias
 */

import { TipoAmbulancia, TipoPerfil, VagaProfissional } from '@/types';

/**
 * Infere automaticamente o tipo de ambulância baseado na equipe de profissionais
 *
 * REGRA:
 * - Se há MÉDICO na equipe → UTI (Unidade de Terapia Intensiva)
 * - Se NÃO há médico → USB (Unidade de Suporte Básico)
 *
 * @param vagas - Lista de profissionais (vagas) da ocorrência
 * @returns TipoAmbulancia.UTI ou TipoAmbulancia.USB
 */
export function inferirTipoAmbulancia(vagas: VagaProfissional[]): TipoAmbulancia {
  // Verificar se há algum médico na equipe
  const temMedico = vagas.some((vaga) => vaga.funcao === TipoPerfil.MEDICO);

  return temMedico ? TipoAmbulancia.UTI : TipoAmbulancia.USB;
}

/**
 * Retorna descrição explicativa do tipo de ambulância inferido
 *
 * @param vagas - Lista de profissionais (vagas) da ocorrência
 * @returns String descritiva do tipo e motivo
 */
export function getDescricaoTipoInferido(vagas: VagaProfissional[]): string {
  const tipo = inferirTipoAmbulancia(vagas);

  if (tipo === TipoAmbulancia.UTI) {
    return 'UTI (Unidade de Terapia Intensiva) - Equipe com médico';
  }

  return 'USB (Unidade de Suporte Básico) - Equipe sem médico';
}
