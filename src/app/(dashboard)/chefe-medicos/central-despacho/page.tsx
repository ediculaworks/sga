'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { ocorrenciasService } from '@/lib/services/ocorrencias';
import { CriarOcorrenciaForm } from '@/components/ocorrencias/CriarOcorrenciaForm';
import { CriarOcorrenciaFormData } from '@/lib/validations/ocorrencia';
// ProtectedRoute removido - autenticação agora é feita via middleware
import { TipoPerfil } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Página de Central de Despacho
 * Exclusiva do Chefe dos Médicos para criar novas ocorrências
 *
 * Funcionalidades:
 * - Formulário completo de criação de ocorrências
 * - Validações com Zod
 * - Criação automática de vagas por tipo de ambulância
 * - Geração automática de número de ocorrência
 */

function CentralDespachoPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: CriarOcorrenciaFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      // Chamar serviço de criação com vagas automáticas
      const resultado = await ocorrenciasService.createComVagas(
        formData,
        formData.quantidade_enfermeiros_adicionais || 0,
        user.id
      );

      // Feedback de sucesso
      toast.success('Ocorrência criada com sucesso!', {
        description: `Número: ${resultado.ocorrencia.numero_ocorrencia} | ${resultado.vagas_criadas} vaga(s) criada(s)`,
      });

      // Redirecionar para o dashboard após 1.5s
      setTimeout(() => {
        router.push('/chefe-medicos');
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao criar ocorrência:', error);
      toast.error('Erro ao criar ocorrência', {
        description: error.message || 'Tente novamente mais tarde',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/chefe-medicos">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Despacho</h1>
          <p className="text-gray-600">
            Crie uma nova ocorrência e defina a equipe necessária
          </p>
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          📋 Como funciona a criação de ocorrências
        </h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>
            • <strong>Ambulância Básica:</strong> 1 vaga de enfermeiro será criada automaticamente
          </li>
          <li>
            • <strong>Ambulância de Emergência:</strong> 1 vaga de médico + 1 vaga de enfermeiro serão criadas
          </li>
          <li>
            • Você pode adicionar enfermeiros extras conforme necessário
          </li>
          <li>
            • Após criada, a ocorrência ficará <strong>EM ABERTO</strong> e os profissionais poderão se inscrever
          </li>
          <li>
            • Quando todas as vagas forem preenchidas, o status mudará automaticamente para <strong>CONFIRMADA</strong>
          </li>
        </ul>
      </div>

      {/* Formulário */}
      <CriarOcorrenciaForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

export default CentralDespachoPage;
