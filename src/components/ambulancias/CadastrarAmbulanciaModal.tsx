'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ambulanciasService } from '@/lib/services/ambulancias';
import { toast } from 'react-hot-toast';
import { StatusAmbulancia } from '@/types';

// Schema de validação
const ambulanciaSchema = z.object({
  placa: z
    .string()
    .min(7, 'Placa deve ter 7 caracteres')
    .max(7, 'Placa deve ter 7 caracteres')
    .regex(/^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/, 'Formato de placa inválido'),
  marca: z.string().min(2, 'Marca é obrigatória'),
  modelo: z.string().min(2, 'Modelo é obrigatório'),
  ano: z.number().int().min(1990, 'Ano deve ser maior que 1990').max(new Date().getFullYear() + 1, 'Ano inválido'),
  motor: z.string().optional(),
  kilometragem: z.number().min(0, 'Kilometragem deve ser positiva'),
  kilometragem_proxima_revisao: z.number().min(0, 'Kilometragem deve ser positiva').optional(),
});

type AmbulanciaFormValues = z.infer<typeof ambulanciaSchema>;

interface CadastrarAmbulanciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CadastrarAmbulanciaModal({
  isOpen,
  onClose,
  onSuccess,
}: CadastrarAmbulanciaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AmbulanciaFormValues>({
    resolver: zodResolver(ambulanciaSchema),
  });

  const onSubmit = async (data: AmbulanciaFormValues) => {
    setIsSubmitting(true);

    try {
      // Converter placa para uppercase
      const placaUpper = data.placa.toUpperCase();

      // Criar objeto de ambulância com valores padrão
      await ambulanciasService.create({
        ...data,
        placa: placaUpper,
        status_ambulancia: StatusAmbulancia.PENDENTE, // Ambulâncias novas sempre começam PENDENTE
        ativo: true,
      });

      toast.success('Ambulância cadastrada com sucesso!');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao cadastrar ambulância:', error);

      // Tratar erro de placa duplicada
      if (error.code === '23505') {
        toast.error('Já existe uma ambulância cadastrada com esta placa.');
      } else {
        toast.error('Erro ao cadastrar ambulância. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Ambulância</DialogTitle>
          <DialogDescription>
            Preencha os dados da ambulância para cadastrá-la no sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Placa */}
            <div className="col-span-1">
              <Label htmlFor="placa">
                Placa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="placa"
                {...register('placa')}
                placeholder="ABC1234 ou ABC1D23"
                className="uppercase"
                maxLength={7}
              />
              {errors.placa && (
                <p className="text-sm text-red-500 mt-1">{errors.placa.message}</p>
              )}
            </div>

            {/* Ano */}
            <div className="col-span-1">
              <Label htmlFor="ano">
                Ano <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ano"
                type="number"
                {...register('ano', { valueAsNumber: true })}
                placeholder="2024"
                min={1990}
                max={new Date().getFullYear() + 1}
              />
              {errors.ano && (
                <p className="text-sm text-red-500 mt-1">{errors.ano.message}</p>
              )}
            </div>

            {/* Marca */}
            <div className="col-span-1">
              <Label htmlFor="marca">
                Marca <span className="text-red-500">*</span>
              </Label>
              <Input id="marca" {...register('marca')} placeholder="Ex: Mercedes-Benz" />
              {errors.marca && (
                <p className="text-sm text-red-500 mt-1">{errors.marca.message}</p>
              )}
            </div>

            {/* Modelo */}
            <div className="col-span-1">
              <Label htmlFor="modelo">
                Modelo <span className="text-red-500">*</span>
              </Label>
              <Input id="modelo" {...register('modelo')} placeholder="Ex: Sprinter 415" />
              {errors.modelo && (
                <p className="text-sm text-red-500 mt-1">{errors.modelo.message}</p>
              )}
            </div>

            {/* Motor */}
            <div className="col-span-2">
              <Label htmlFor="motor">Motor</Label>
              <Input id="motor" {...register('motor')} placeholder="Ex: 2.2 CDI Diesel" />
              {errors.motor && (
                <p className="text-sm text-red-500 mt-1">{errors.motor.message}</p>
              )}
            </div>

            {/* Kilometragem */}
            <div className="col-span-1">
              <Label htmlFor="kilometragem">
                Kilometragem Inicial <span className="text-red-500">*</span>
              </Label>
              <Input
                id="kilometragem"
                type="number"
                {...register('kilometragem', { valueAsNumber: true })}
                placeholder="0"
                min={0}
              />
              {errors.kilometragem && (
                <p className="text-sm text-red-500 mt-1">{errors.kilometragem.message}</p>
              )}
            </div>

            {/* Kilometragem Próxima Revisão */}
            <div className="col-span-1">
              <Label htmlFor="kilometragem_proxima_revisao">Próxima Revisão (km)</Label>
              <Input
                id="kilometragem_proxima_revisao"
                type="number"
                {...register('kilometragem_proxima_revisao', { valueAsNumber: true })}
                placeholder="10000"
                min={0}
              />
              {errors.kilometragem_proxima_revisao && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.kilometragem_proxima_revisao.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar Ambulância'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
