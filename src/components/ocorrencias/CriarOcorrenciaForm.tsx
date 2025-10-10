'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { TipoAmbulancia, TipoTrabalho, VagaProfissional } from '@/types';
import {
  criarOcorrenciaSchema,
  CriarOcorrenciaFormData,
} from '@/lib/validations/ocorrencia';
import {
  TIPO_AMBULANCIA_LABELS,
  TIPO_TRABALHO_LABELS,
} from '@/lib/utils/styles';
import { formatarInputData, formatarInputHora } from '@/lib/utils/formatters';
import { DynamicProfessionalList } from './DynamicProfessionalList';
import { inferirTipoAmbulancia, getDescricaoTipoInferido } from '@/lib/utils/ambulancia';

interface CriarOcorrenciaFormProps {
  onSubmit: (data: CriarOcorrenciaFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function CriarOcorrenciaForm({
  onSubmit,
  isSubmitting,
}: CriarOcorrenciaFormProps) {
  const [vagas, setVagas] = useState<VagaProfissional[]>([]);
  const [tipoInferido, setTipoInferido] = useState<TipoAmbulancia | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(criarOcorrenciaSchema),
    defaultValues: {
      valor_enfermeiro: 0,
      valor_medico: 0,
    },
  });

  const tipoAmbulancia = watch('tipo_ambulancia');
  const tipoTrabalho = watch('tipo_trabalho');

  // Atualizar tipo inferido quando vagas mudam
  useEffect(() => {
    if (vagas.length > 0) {
      const tipo = inferirTipoAmbulancia(vagas);
      setTipoInferido(tipo);
    } else {
      setTipoInferido(null);
    }
  }, [vagas]);

  // Wrapper para adicionar vagas ao formData antes de submeter
  const handleFormSubmit = async (formData: any) => {
    // Validar que há pelo menos 1 profissional
    if (vagas.length === 0) {
      alert('É necessário adicionar pelo menos 1 profissional à equipe');
      return;
    }

    // Adicionar vagas ao formData
    const dataComVagas = {
      ...formData,
      vagas,
    };

    await onSubmit(dataComVagas);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* SEÇÃO 1: Equipe de Profissionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Equipe de Profissionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista Dinâmica de Profissionais */}
          <DynamicProfessionalList
            vagas={vagas}
            onChange={setVagas}
          />

          {/* Display do Tipo Inferido */}
          {vagas.length > 0 && tipoInferido && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Tipo de Ambulância (inferido automaticamente)
              </p>
              <p className="text-sm text-blue-700">
                {getDescricaoTipoInferido(vagas)}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                ℹ️ O tipo é determinado automaticamente pela presença de médico na equipe
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEÇÃO 2: Detalhes da Ocorrência */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Detalhes da Ocorrência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tipo de Trabalho */}
          <div className="space-y-2">
            <Label htmlFor="tipo_trabalho">
              Tipo de Trabalho <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue('tipo_trabalho', value as TipoTrabalho)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TipoTrabalho.EVENTO}>
                  {TIPO_TRABALHO_LABELS[TipoTrabalho.EVENTO]}
                </SelectItem>
                <SelectItem value={TipoTrabalho.EMERGENCIA}>
                  {TIPO_TRABALHO_LABELS[TipoTrabalho.EMERGENCIA]}
                </SelectItem>
                <SelectItem value={TipoTrabalho.DOMICILIAR}>
                  {TIPO_TRABALHO_LABELS[TipoTrabalho.DOMICILIAR]}
                </SelectItem>
                <SelectItem value={TipoTrabalho.TRANSFERENCIA}>
                  {TIPO_TRABALHO_LABELS[TipoTrabalho.TRANSFERENCIA]}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo_trabalho && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.tipo_trabalho.message}
              </p>
            )}
          </div>

          {/* Data da Ocorrência */}
          <div className="space-y-2">
            <Label htmlFor="data_ocorrencia">
              Data da Ocorrência <span className="text-red-500">*</span>
            </Label>
            <Input
              id="data_ocorrencia"
              type="text"
              {...register('data_ocorrencia')}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              onInput={(e) => {
                e.currentTarget.value = formatarInputData(e.currentTarget.value);
              }}
            />
            <p className="text-xs text-gray-500">
              Digite a data no formato DD/MM/AAAA (ex: 15/12/2025)
            </p>
            {errors.data_ocorrencia && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.data_ocorrencia.message}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Detalhes adicionais sobre a ocorrência..."
              rows={4}
            />
            {errors.descricao && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.descricao.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 3: Local e Horários */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Local e Horários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Local da Ocorrência */}
          <div className="space-y-2">
            <Label htmlFor="local_ocorrencia">
              Local da Ocorrência <span className="text-red-500">*</span>
            </Label>
            <Input
              id="local_ocorrencia"
              {...register('local_ocorrencia')}
              placeholder="Ex: Hospital Municipal, Estádio do Maracanã"
            />
            {errors.local_ocorrencia && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.local_ocorrencia.message}
              </p>
            )}
          </div>

          {/* Endereço Completo */}
          <div className="space-y-2">
            <Label htmlFor="endereco_completo">Endereço Completo (opcional)</Label>
            <Input
              id="endereco_completo"
              {...register('endereco_completo')}
              placeholder="Rua, número, bairro, cidade - CEP"
            />
            {errors.endereco_completo && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.endereco_completo.message}
              </p>
            )}
          </div>

          {/* Campos específicos para TRANSFERENCIA */}
          {tipoTrabalho === TipoTrabalho.TRANSFERENCIA && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="local_origem">
                  Local de Origem <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="local_origem"
                  {...register('local_origem')}
                  placeholder="Ex: Hospital Municipal"
                />
                {errors.local_origem && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.local_origem.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="local_destino">
                  Local de Destino <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="local_destino"
                  {...register('local_destino')}
                  placeholder="Ex: Hospital de Base"
                />
                {errors.local_destino && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.local_destino.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Horários (Grid 2 ou 3 colunas dependendo do tipo) */}
          <div className={`grid grid-cols-1 gap-4 ${tipoTrabalho === TipoTrabalho.EVENTO ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            <div className="space-y-2">
              <Label htmlFor="horario_saida">
                Horário de Saída <span className="text-red-500">*</span>
              </Label>
              <Input
                id="horario_saida"
                type="text"
                {...register('horario_saida')}
                placeholder="HH:MM"
                maxLength={5}
                onInput={(e) => {
                  e.currentTarget.value = formatarInputHora(e.currentTarget.value);
                }}
              />
              <p className="text-xs text-gray-500">Digite o horário (ex: 14:30)</p>
              {errors.horario_saida && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.horario_saida.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario_chegada_local">
                Horário no Local <span className="text-red-500">*</span>
              </Label>
              <Input
                id="horario_chegada_local"
                type="text"
                {...register('horario_chegada_local')}
                placeholder="HH:MM"
                maxLength={5}
                onInput={(e) => {
                  e.currentTarget.value = formatarInputHora(e.currentTarget.value);
                }}
              />
              <p className="text-xs text-gray-500">Digite o horário (ex: 15:00)</p>
              {errors.horario_chegada_local && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.horario_chegada_local.message}
                </p>
              )}
            </div>

            {/* Horário de Término - APENAS para EVENTO */}
            {tipoTrabalho === TipoTrabalho.EVENTO && (
              <div className="space-y-2">
                <Label htmlFor="horario_termino">
                  Horário de Término <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="horario_termino"
                  type="text"
                  {...register('horario_termino')}
                  placeholder="HH:MM"
                  maxLength={5}
                  onInput={(e) => {
                    let value = e.currentTarget.value.replace(/\D/g, '');
                    if (value.length >= 3) {
                      value = value.slice(0, 2) + ':' + value.slice(2, 4);
                    }
                    e.currentTarget.value = value;
                  }}
                />
                <p className="text-xs text-gray-500">Digite o horário (ex: 18:00)</p>
                {errors.horario_termino && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.horario_termino.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 4: Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">4. Informações de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valor Médico (apenas se UTI - ambulância com médico) */}
            {tipoInferido === TipoAmbulancia.UTI && (
              <div className="space-y-2">
                <Label htmlFor="valor_medico">
                  Valor Médico (R$) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="valor_medico"
                  type="text"
                  inputMode="decimal"
                  {...register('valor_medico')}
                  placeholder="0.00"
                  onKeyPress={(e) => {
                    // Permitir apenas números, vírgula e ponto
                    if (!/[0-9.,]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                {errors.valor_medico && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.valor_medico.message}
                  </p>
                )}
              </div>
            )}

            {/* Valor Enfermeiro */}
            <div className="space-y-2">
              <Label htmlFor="valor_enfermeiro">
                Valor Enfermeiro (R$) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="valor_enfermeiro"
                type="text"
                inputMode="decimal"
                {...register('valor_enfermeiro')}
                placeholder="0.00"
                onKeyPress={(e) => {
                  // Permitir apenas números, vírgula e ponto
                  if (!/[0-9.,]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.valor_enfermeiro && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.valor_enfermeiro.message}
                </p>
              )}
            </div>

            {/* Data de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="data_pagamento">
                Data de Pagamento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="data_pagamento"
                type="text"
                {...register('data_pagamento')}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                onInput={(e) => {
                  e.currentTarget.value = formatarInputData(e.currentTarget.value);
                }}
              />
              <p className="text-xs text-gray-500">Data de pagamento (ex: 31/12/2025)</p>
              {errors.data_pagamento && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.data_pagamento.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Ocorrência'
          )}
        </Button>
      </div>
    </form>
  );
}
