'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, X } from 'lucide-react';

interface AdicionarNotaModalProps {
  atendimentoId: number | null;
  pacienteNome: string;
  isOpen: boolean;
  onClose: () => void;
  onSalvarNota: (atendimentoId: number, nota: string) => Promise<void>;
}

/**
 * Modal para enfermeiros adicionarem notas sobre pacientes durante ocorrência em andamento
 *
 * FASE 6.2 - Sistema de Notas do Enfermeiro
 */
export function AdicionarNotaModal({
  atendimentoId,
  pacienteNome,
  isOpen,
  onClose,
  onSalvarNota,
}: AdicionarNotaModalProps) {
  const [nota, setNota] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSalvar = async () => {
    if (!atendimentoId || !nota.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSalvarNota(atendimentoId, nota.trim());
      setNota('');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setNota('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Adicionar Nota de Enfermagem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informação do Paciente */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">Paciente:</p>
            <p className="font-semibold text-gray-900">{pacienteNome}</p>
          </div>

          {/* Textarea para a nota */}
          <div className="space-y-2">
            <Label htmlFor="nota">Nota de Enfermagem</Label>
            <Textarea
              id="nota"
              placeholder="Digite suas observações sobre o paciente..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={8}
              disabled={isSaving}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Registre observações importantes sobre o quadro clínico, procedimentos realizados,
              medicações administradas ou qualquer informação relevante.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={!nota.trim() || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Salvar Nota
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
