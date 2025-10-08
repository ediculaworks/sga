'use client';

import { useState } from 'react';
import { PacientesTable } from '@/components/pacientes/PacientesTable';
import { PacienteHistoricoModal } from '@/components/pacientes/PacienteHistoricoModal';
import { ProntuarioModal } from '@/components/pacientes/ProntuarioModal';

export default function PacientesChefeMedicosPage() {
  const [selectedPacienteId, setSelectedPacienteId] = useState<number | null>(
    null
  );
  const [selectedAtendimentoId, setSelectedAtendimentoId] = useState<
    number | null
  >(null);
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);
  const [isProntuarioOpen, setIsProntuarioOpen] = useState(false);

  const handleVerHistorico = (pacienteId: number) => {
    setSelectedPacienteId(pacienteId);
    setIsHistoricoOpen(true);
  };

  const handleVerProntuario = (atendimentoId: number) => {
    setSelectedAtendimentoId(atendimentoId);
    setIsHistoricoOpen(false);
    setIsProntuarioOpen(true);
  };

  const handleCloseHistorico = () => {
    setIsHistoricoOpen(false);
    setSelectedPacienteId(null);
  };

  const handleCloseProntuario = () => {
    setIsProntuarioOpen(false);
    setSelectedAtendimentoId(null);
    // Reabrir modal de histórico se ainda tiver paciente selecionado
    if (selectedPacienteId) {
      setIsHistoricoOpen(true);
    }
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

      <PacienteHistoricoModal
        pacienteId={selectedPacienteId}
        isOpen={isHistoricoOpen}
        onClose={handleCloseHistorico}
        onVerProntuario={handleVerProntuario}
      />

      <ProntuarioModal
        atendimentoId={selectedAtendimentoId}
        isOpen={isProntuarioOpen}
        onClose={handleCloseProntuario}
      />
    </div>
  );
}
