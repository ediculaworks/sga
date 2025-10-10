'use client';

import { useState } from 'react';
import { Plus, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfessionalSelector } from './ProfessionalSelector';
import { TipoVaga, VagaProfissional, TipoPerfil } from '@/types';

interface DynamicProfessionalListProps {
  vagas: VagaProfissional[];
  onChange: (vagas: VagaProfissional[]) => void;
}

export function DynamicProfessionalList({
  vagas,
  onChange,
}: DynamicProfessionalListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddVaga = () => {
    // Adicionar uma nova vaga vazia (usuário vai escolher o tipo)
    const novaVaga: VagaProfissional = {
      tipo: TipoVaga.ABERTA_MEDICO,
      funcao: TipoPerfil.MEDICO,
      usuarioDesignado: null,
    };
    onChange([...vagas, novaVaga]);
    setEditingIndex(vagas.length); // Editar a vaga recém-adicionada
  };

  const handleRemoveVaga = (index: number) => {
    const novasVagas = vagas.filter((_, i) => i !== index);
    onChange(novasVagas);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleUpdateVaga = (index: number, vaga: VagaProfissional) => {
    const novasVagas = [...vagas];
    novasVagas[index] = vaga;
    onChange(novasVagas);
  };

  const formatVagaLabel = (vaga: VagaProfissional): string => {
    if (vaga.tipo === TipoVaga.DESIGNADA && vaga.usuarioDesignado) {
      return `${vaga.funcao} - ${vaga.usuarioDesignado.nome_completo} (Designado)`;
    }
    if (vaga.tipo === TipoVaga.ABERTA_MEDICO) {
      return 'Médico (Vaga Aberta)';
    }
    if (vaga.tipo === TipoVaga.ABERTA_ENFERMEIRO) {
      return 'Enfermeiro (Vaga Aberta)';
    }
    return 'Vaga não configurada';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Profissionais
        </label>
        <Button
          type="button"
          onClick={handleAddVaga}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Profissional
        </Button>
      </div>

      {vagas.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-2">
            Nenhum profissional adicionado
          </p>
          <p className="text-xs text-gray-400">
            Clique em "Adicionar Profissional" para começar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vagas.map((vaga, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {formatVagaLabel(vaga)}
                  </p>
                  {vaga.tipo !== TipoVaga.DESIGNADA && (
                    <p className="text-xs text-gray-500 mt-1">
                      Profissionais poderão se candidatar para esta vaga
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditingIndex(editingIndex === index ? null : index)
                    }
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {editingIndex === index ? 'Fechar' : 'Editar'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveVaga(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {editingIndex === index && (
                <div className="pt-3 border-t border-gray-200">
                  <ProfessionalSelector
                    vaga={vaga}
                    onChange={(novaVaga) => handleUpdateVaga(index, novaVaga)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {vagas.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>Total de profissionais:</strong> {vagas.length} (
            {vagas.filter((v) => v.tipo === TipoVaga.ABERTA_MEDICO).length}{' '}
            médico(s) aberto,{' '}
            {vagas.filter((v) => v.tipo === TipoVaga.ABERTA_ENFERMEIRO).length}{' '}
            enfermeiro(s) aberto,{' '}
            {vagas.filter((v) => v.tipo === TipoVaga.DESIGNADA).length}{' '}
            designado(s))
          </p>
        </div>
      )}
    </div>
  );
}
