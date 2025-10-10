'use client';

import { useState } from 'react';
import { UserCheck, UserCircle2, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableProfessionalList } from './SearchableProfessionalList';
import { TipoVaga, VagaProfissional, TipoPerfil } from '@/types';

interface ProfessionalSelectorProps {
  vaga: VagaProfissional;
  onChange: (vaga: VagaProfissional) => void;
}

export function ProfessionalSelector({
  vaga,
  onChange,
}: ProfessionalSelectorProps) {
  const [showProfessionalList, setShowProfessionalList] = useState(false);

  const handleSelectTipo = (tipo: TipoVaga) => {
    if (tipo === TipoVaga.ABERTA_MEDICO) {
      onChange({
        tipo: TipoVaga.ABERTA_MEDICO,
        funcao: TipoPerfil.MEDICO,
        usuarioDesignado: null,
      });
      setShowProfessionalList(false);
    } else if (tipo === TipoVaga.ABERTA_ENFERMEIRO) {
      onChange({
        tipo: TipoVaga.ABERTA_ENFERMEIRO,
        funcao: TipoPerfil.ENFERMEIRO,
        usuarioDesignado: null,
      });
      setShowProfessionalList(false);
    } else if (tipo === TipoVaga.DESIGNADA) {
      setShowProfessionalList(true);
    }
  };

  const handleSelectProfissional = (
    profissional: { id: number; nome_completo: string; tipo_perfil: TipoPerfil }
  ) => {
    onChange({
      tipo: TipoVaga.DESIGNADA,
      funcao: profissional.tipo_perfil,
      usuarioDesignado: {
        id: profissional.id,
        nome_completo: profissional.nome_completo,
      },
    });
    setShowProfessionalList(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Button
          type="button"
          variant={vaga.tipo === TipoVaga.ABERTA_MEDICO ? 'default' : 'outline'}
          onClick={() => handleSelectTipo(TipoVaga.ABERTA_MEDICO)}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <UserCircle2 className="w-6 h-6" />
          <span className="text-sm">Médico</span>
          <span className="text-xs text-gray-500">Vaga Aberta</span>
        </Button>

        <Button
          type="button"
          variant={
            vaga.tipo === TipoVaga.ABERTA_ENFERMEIRO ? 'default' : 'outline'
          }
          onClick={() => handleSelectTipo(TipoVaga.ABERTA_ENFERMEIRO)}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <UserCheck className="w-6 h-6" />
          <span className="text-sm">Enfermeiro</span>
          <span className="text-xs text-gray-500">Vaga Aberta</span>
        </Button>

        <Button
          type="button"
          variant={vaga.tipo === TipoVaga.DESIGNADA ? 'default' : 'outline'}
          onClick={() => handleSelectTipo(TipoVaga.DESIGNADA)}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <UserCog className="w-6 h-6" />
          <span className="text-sm">Designar</span>
          <span className="text-xs text-gray-500">Profissional</span>
        </Button>
      </div>

      {showProfessionalList && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <SearchableProfessionalList
            onSelect={handleSelectProfissional}
            selectedId={vaga.usuarioDesignado?.id}
          />
        </div>
      )}

      {vaga.tipo === TipoVaga.DESIGNADA && vaga.usuarioDesignado && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            <strong>Profissional Designado:</strong>{' '}
            {vaga.usuarioDesignado.nome_completo}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Este profissional será automaticamente alocado nesta ocorrência
          </p>
        </div>
      )}
    </div>
  );
}
