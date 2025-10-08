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

    // Quantidade adicional de enfermeiros (além da quantidade padrão)
    quantidade_enfermeiros_adicionais: z
      .union([z.string(), z.number()])
      .pipe(z.coerce.number())
      .pipe(
        z
          .number()
          .int('Quantidade deve ser um número inteiro')
          .min(0, 'Quantidade não pode ser negativa')
          .max(5, 'Máximo de 5 enfermeiros adicionais')
      ),

    // Tipo de trabalho
    tipo_trabalho: z.nativeEnum(TipoTrabalho, {
      message: 'Selecione o tipo de trabalho',
    }),

    // Data da ocorrência
    data_ocorrencia: z
      .string({
        message: 'Data da ocorrência é obrigatória',
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
      .refine(
        (data) => {
          const dataOcorrencia = new Date(data + 'T00:00:00');
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          return dataOcorrencia >= hoje;
        },
        { message: 'Data não pode ser no passado' }
      ),

    // Horários
    horario_saida: z
      .string({
        message: 'Horário de saída é obrigatório',
      })
      .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),

    horario_chegada_local: z
      .string({
        message: 'Horário previsto no local é obrigatório',
      })
      .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),

    // Horário de término (obrigatório apenas para EVENTO)
    horario_termino: z
      .string()
      .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
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

    // Coordenadas GPS (opcionais)
    latitude: z
      .union([z.string(), z.number()])
      .pipe(z.coerce.number())
      .pipe(z.number().min(-90, 'Latitude inválida').max(90, 'Latitude inválida'))
      .optional()
      .nullable(),

    longitude: z
      .union([z.string(), z.number()])
      .pipe(z.coerce.number())
      .pipe(z.number().min(-180, 'Longitude inválida').max(180, 'Longitude inválida'))
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

    // Data de pagamento
    data_pagamento: z
      .string({
        message: 'Data de pagamento é obrigatória',
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  })
  .refine(
    (data) => {
      // Validação: horario_termino é obrigatório se tipo_trabalho é EVENTO
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
      if (!data.horario_termino) return true;

      const [horaChegada, minChegada] = data.horario_chegada_local.split(':').map(Number);
      const [horaTermino, minTermino] = data.horario_termino.split(':').map(Number);

      const chegada = horaChegada * 60 + minChegada;
      const termino = horaTermino * 60 + minTermino;

      return termino > chegada;
    },
    {
      message: 'Horário de término deve ser posterior ao horário no local',
      path: ['horario_termino'],
    }
  )
  .refine(
    (data) => {
      // Validação: valor_medico é obrigatório se tipo_ambulancia é EMERGENCIA
      if (data.tipo_ambulancia === TipoAmbulancia.EMERGENCIA && !data.valor_medico) {
        return false;
      }
      return true;
    },
    {
      message: 'Valor do médico é obrigatório para ambulância de emergência',
      path: ['valor_medico'],
    }
  );

/**
 * Tipo inferido do schema de validação
 */
export type CriarOcorrenciaFormData = z.infer<typeof criarOcorrenciaSchema>;
