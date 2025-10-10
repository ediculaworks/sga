import { z } from 'zod';
import { TipoAmbulancia, TipoTrabalho } from '@/types';

/**
 * Schema de validação para criação de ocorrências
 * Usado no formulário de Central de Despacho (Chefe dos Médicos)
 */

export const criarOcorrenciaSchema = z
  .object({
    // Tipo de ambulância (define vagas automaticamente)
    tipo_ambulancia: z.nativeEnum(TipoAmbulancia, {
      message: 'Selecione o tipo de ambulância',
    }),

    // Tipo de trabalho
    tipo_trabalho: z.nativeEnum(TipoTrabalho, {
      message: 'Selecione o tipo de trabalho',
    }),

    // Data da ocorrência (aceita DD/MM/YYYY ou YYYY-MM-DD)
    data_ocorrencia: z
      .string({
        message: 'Data da ocorrência é obrigatória',
      })
      .min(1, 'Data da ocorrência é obrigatória')
      .transform((val) => {
        // Se já está no formato YYYY-MM-DD, retorna direto
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          return val;
        }
        // Se está no formato DD/MM/YYYY, converte
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
          const [dia, mes, ano] = val.split('/');
          return `${ano}-${mes}-${dia}`;
        }
        return val;
      })
      .refine(
        (data) => {
          // Valida se é uma data válida
          if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            return false;
          }
          const dataOcorrencia = new Date(data + 'T00:00:00');
          return !isNaN(dataOcorrencia.getTime());
        },
        { message: 'Data inválida. Use o formato DD/MM/AAAA' }
      )
      .refine(
        (data) => {
          const dataOcorrencia = new Date(data + 'T00:00:00');
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          return dataOcorrencia >= hoje;
        },
        { message: 'Data não pode ser no passado' }
      ),

    // Horários (validação flexível)
    horario_saida: z
      .string({
        message: 'Horário de saída é obrigatório',
      })
      .min(1, 'Horário de saída é obrigatório')
      .refine(
        (val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val),
        { message: 'Horário inválido. Use o formato HH:MM (ex: 14:30)' }
      ),

    horario_chegada_local: z
      .string({
        message: 'Horário no local é obrigatório',
      })
      .min(1, 'Horário no local é obrigatório')
      .refine(
        (val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val),
        { message: 'Horário inválido. Use o formato HH:MM (ex: 14:30)' }
      ),

    // Horário de término (obrigatório apenas para EVENTO)
    horario_termino: z
      .string()
      .refine(
        (val) => {
          if (!val || val === '') return true;
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val);
        },
        { message: 'Horário inválido. Use o formato HH:MM (ex: 18:00)' }
      )
      .optional()
      .nullable(),

    // Local e endereço
    local_ocorrencia: z
      .string({
        message: 'Local da ocorrência é obrigatório',
      })
      .min(3, 'Local deve ter pelo menos 3 caracteres')
      .max(255, 'Local não pode ter mais de 255 caracteres'),

    endereco_completo: z
      .string()
      .max(500, 'Endereço não pode ter mais de 500 caracteres')
      .optional()
      .nullable(),

    // Campos específicos para TRANSFERENCIA
    local_origem: z
      .string()
      .max(255, 'Local de origem não pode ter mais de 255 caracteres')
      .optional()
      .nullable(),

    local_destino: z
      .string()
      .max(255, 'Local de destino não pode ter mais de 255 caracteres')
      .optional()
      .nullable(),

    // Descrição
    descricao: z
      .string()
      .max(1000, 'Descrição não pode ter mais de 1000 caracteres')
      .optional()
      .nullable(),

    // Valores de pagamento
    valor_medico: z
      .union([z.string(), z.number()])
      .pipe(z.coerce.number())
      .pipe(z.number().min(0, 'Valor não pode ser negativo'))
      .optional()
      .nullable(),

    valor_enfermeiro: z
      .union([z.string(), z.number()])
      .pipe(z.coerce.number())
      .pipe(z.number().min(0, 'Valor não pode ser negativo')),

    // Data de pagamento (aceita DD/MM/YYYY ou YYYY-MM-DD)
    data_pagamento: z
      .string({
        message: 'Data de pagamento é obrigatória',
      })
      .min(1, 'Data de pagamento é obrigatória')
      .transform((val) => {
        // Se já está no formato YYYY-MM-DD, retorna direto
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          return val;
        }
        // Se está no formato DD/MM/YYYY, converte
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
          const [dia, mes, ano] = val.split('/');
          return `${ano}-${mes}-${dia}`;
        }
        return val;
      })
      .refine(
        (data) => {
          // Valida se é uma data válida
          if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            return false;
          }
          const dataPagamento = new Date(data + 'T00:00:00');
          return !isNaN(dataPagamento.getTime());
        },
        { message: 'Data inválida. Use o formato DD/MM/AAAA' }
      ),
  })
  .refine(
    (data) => {
      // Validação: horario_termino é obrigatório APENAS para EVENTO
      if (data.tipo_trabalho === TipoTrabalho.EVENTO && !data.horario_termino) {
        return false;
      }
      return true;
    },
    {
      message: 'Horário de término é obrigatório para eventos',
      path: ['horario_termino'],
    }
  )
  .refine(
    (data) => {
      // Validação: local_origem e local_destino são obrigatórios para TRANSFERENCIA
      if (data.tipo_trabalho === TipoTrabalho.TRANSFERENCIA) {
        if (!data.local_origem || !data.local_destino) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Local de origem e destino são obrigatórios para transferências',
      path: ['local_origem'],
    }
  )
  .refine(
    (data) => {
      // Validação: horario_chegada_local deve ser depois de horario_saida
      const [horaSaida, minSaida] = data.horario_saida.split(':').map(Number);
      const [horaChegada, minChegada] = data.horario_chegada_local.split(':').map(Number);

      const saida = horaSaida * 60 + minSaida;
      const chegada = horaChegada * 60 + minChegada;

      return chegada > saida;
    },
    {
      message: 'Horário no local deve ser posterior ao horário de saída',
      path: ['horario_chegada_local'],
    }
  )
  .refine(
    (data) => {
      // Validação: horario_termino deve ser depois de horario_chegada_local (se fornecido)
      // PERMITE horários após meia-noite (eventos que passam para o dia seguinte)
      if (!data.horario_termino) return true;

      const [horaChegada, minChegada] = data.horario_chegada_local.split(':').map(Number);
      const [horaTermino, minTermino] = data.horario_termino.split(':').map(Number);

      const chegada = horaChegada * 60 + minChegada;
      let termino = horaTermino * 60 + minTermino;

      // Se o horário de término for menor que a chegada, assume que passou da meia-noite
      // Adiciona 24 horas (1440 minutos) ao horário de término
      if (termino <= chegada) {
        termino += 1440; // 24 horas em minutos
      }

      return termino > chegada;
    },
    {
      message: 'Horário de término deve ser posterior ao horário no local',
      path: ['horario_termino'],
    }
  )
  .refine(
    (data) => {
      // Validação: valor_medico é obrigatório se tipo_ambulancia é UTI (com médico)
      if (data.tipo_ambulancia === TipoAmbulancia.UTI && !data.valor_medico) {
        return false;
      }
      return true;
    },
    {
      message: 'Valor do médico é obrigatório para ambulância UTI (com médico)',
      path: ['valor_medico'],
    }
  );

/**
 * Tipo inferido do schema de validação
 */
export type CriarOcorrenciaFormData = z.infer<typeof criarOcorrenciaSchema>;
