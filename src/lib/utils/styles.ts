/**
 * Utilitários de Estilos
 *
 * Funções centralizadas para classes CSS dinâmicas (badges, cores, etc).
 */

/**
 * Retorna classes CSS para badges baseado no tipo e valor
 */
export function getBadgeColor(type: string, value: string): string {
  if (type === 'tipo_trabalho') {
    switch (value) {
      case 'EVENTO':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EMERGENCIA':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DOMICILIAR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TRANSFERENCIA':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  if (type === 'tipo_ambulancia') {
    switch (value) {
      case 'BASICA':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EMERGENCIA':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  if (type === 'status') {
    return value === 'disponivel'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  }

  return 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Retorna classes CSS para badges de status de ocorrência
 */
export const STATUS_COLORS: Record<string, string> = {
  EM_ABERTO: 'bg-blue-100 text-blue-800 border-blue-200',
  CONFIRMADA: 'bg-green-100 text-green-800 border-green-200',
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONCLUIDA: 'bg-gray-100 text-gray-800 border-gray-200',
};

/**
 * Retorna labels de status de ocorrência
 */
export const STATUS_LABELS: Record<string, string> = {
  EM_ABERTO: 'Em Aberto',
  CONFIRMADA: 'Confirmada',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDA: 'Concluída',
};

/**
 * Retorna labels de tipo de trabalho
 */
export const TIPO_TRABALHO_LABELS: Record<string, string> = {
  EVENTO: 'Evento',
  DOMICILIAR: 'Domiciliar',
  EMERGENCIA: 'Emergência',
  TRANSFERENCIA: 'Transferência',
};

/**
 * Retorna labels de tipo de ambulância
 */
export const TIPO_AMBULANCIA_LABELS: Record<string, string> = {
  BASICA: 'Básica',
  EMERGENCIA: 'Emergência',
};
