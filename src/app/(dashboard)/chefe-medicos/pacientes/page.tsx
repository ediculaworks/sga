'use client';

import { useState } from 'react';
import { PacientesTable } from '@/components/pacientes/PacientesTable';

export default function PacientesChefeMedicosPage() {
  const [selectedPacienteId, setSelectedPacienteId] = useState<number | null>(
    null
  );

  const handleVerHistorico = (pacienteId: number) => {
    setSelectedPacienteId(pacienteId);
    // TODO: Abrir modal de histórico (FASE 5.2)
    console.log('Ver histórico do paciente:', pacienteId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600 mt-1">
            Banco de dados de pacientes atendidos
          </p>
        </div>
      </div>

      <PacientesTable onVerHistorico={handleVerHistorico} />
    </div>
  );
}
