'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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
import { TipoAmbulancia, TipoTrabalho } from '@/types';
import {
  criarOcorrenciaSchema,
  CriarOcorrenciaFormData,
} from '@/lib/validations/ocorrencia';
import {
  TIPO_AMBULANCIA_LABELS,
  TIPO_TRABALHO_LABELS,
} from '@/lib/utils/styles';

interface CriarOcorrenciaFormProps {
  onSubmit: (data: CriarOcorrenciaFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function CriarOcorrenciaForm({
  onSubmit,
  isSubmitting,
}: CriarOcorrenciaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CriarOcorrenciaFormData>({
    resolver: zodResolver(criarOcorrenciaSchema),
    defaultValues: {
      quantidade_enfermeiros_adicionais: 0,
      valor_enfermeiro: 0,
      valor_medico: 0,
    },
  });

  const tipoAmbulancia = watch('tipo_ambulancia');
  const tipoTrabalho = watch('tipo_trabalho');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* SEÇÃO 1: Tipo de Ambulância e Equipe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Tipo de Ambulância e Equipe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tipo de Ambulância */}
          <div className="space-y-2">
            <Label htmlFor="tipo_ambulancia">
              Tipo de Ambulância <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue('tipo_ambulancia', value as TipoAmbulancia)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TipoAmbulancia.BASICA}>
                  {TIPO_AMBULANCIA_LABELS[TipoAmbulancia.BASICA]} (1 Enfermeiro)
                </SelectItem>
                <SelectItem value={TipoAmbulancia.EMERGENCIA}>
                  {TIPO_AMBULANCIA_LABELS[TipoAmbulancia.EMERGENCIA]} (1 Médico + 1
                  Enfermeiro)
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo_ambulancia && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.tipo_ambulancia.message}
              </p>
            )}
          </div>

          {/* Equipe Automática - Info */}
          {tipoAmbulancia && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex gap-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Equipe mínima automaticamente criada:</p>
                {tipoAmbulancia === TipoAmbulancia.BASICA ? (
                  <p>• 1 vaga de Enfermeiro</p>
                ) : (
                  <>
                    <p>• 1 vaga de Médico</p>
                    <p>• 1 vaga de Enfermeiro</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quantidade adicional de enfermeiros */}
          <div className="space-y-2">
            <Label htmlFor="quantidade_enfermeiros_adicionais">
              Enfermeiros Adicionais (opcional)
            </Label>
            <Input
              id="quantidade_enfermeiros_adicionais"
              type="number"
              min="0"
              max="5"
              {...register('quantidade_enfermeiros_adicionais', {
                valueAsNumber: true,
              })}
              placeholder="0"
            />
            <p className="text-sm text-gray-500">
              Número de enfermeiros extras além da equipe mínima (máximo 5)
            </p>
            {errors.quantidade_enfermeiros_adicionais && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.quantidade_enfermeiros_adicionais.message}
              </p>
            )}
          </div>
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
              type="date"
              {...register('data_ocorrencia')}
              min={new Date().toISOString().split('T')[0]}
            />
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

          {/* Coordenadas GPS (Grid 2 colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude (opcional)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...register('latitude', { valueAsNumber: true })}
                placeholder="-22.9068"
              />
              {errors.latitude && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.latitude.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude (opcional)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...register('longitude', { valueAsNumber: true })}
                placeholder="-43.1729"
              />
              {errors.longitude && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.longitude.message}
                </p>
              )}
            </div>
          </div>

          {/* Horários (Grid 3 colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horario_saida">
                Horário de Saída <span className="text-red-500">*</span>
              </Label>
              <Input
                id="horario_saida"
                type="time"
                {...register('horario_saida')}
              />
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
                type="time"
                {...register('horario_chegada_local')}
              />
              {errors.horario_chegada_local && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.horario_chegada_local.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario_termino">
                Horário de Término
                {tipoTrabalho === TipoTrabalho.EVENTO && (
                  <span className="text-red-500"> *</span>
                )}
              </Label>
              <Input
                id="horario_termino"
                type="time"
                {...register('horario_termino')}
              />
              <p className="text-xs text-gray-500">
                Obrigatório para eventos
              </p>
              {errors.horario_termino && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.horario_termino.message}
                </p>
              )}
            </div>
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
            {/* Valor Médico (apenas se EMERGENCIA) */}
            {tipoAmbulancia === TipoAmbulancia.EMERGENCIA && (
              <div className="space-y-2">
                <Label htmlFor="valor_medico">
                  Valor Médico (R$) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="valor_medico"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valor_medico', { valueAsNumber: true })}
                  placeholder="0.00"
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
                type="number"
                step="0.01"
                min="0"
                {...register('valor_enfermeiro', { valueAsNumber: true })}
                placeholder="0.00"
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
                type="date"
                {...register('data_pagamento')}
              />
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
