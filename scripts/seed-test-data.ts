/**
 * Script para popular o banco de dados com dados de teste
 *
 * Cria:
 * - Ocorrências de exemplo (EM_ABERTO e CONFIRMADA)
 * - Vagas para médicos e enfermeiros
 * - Ambulâncias
 *
 * Como executar:
 * npx tsx scripts/seed-test-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedTestData() {
  console.log('🌱 Iniciando seed de dados de teste...\n');

  try {
    // 1. Usar IDs fixos dos usuários de teste
    console.log('📋 Usando IDs de usuários de teste...');
    const medico = { id: 1, nome_completo: 'Dr. João Silva' };
    const enfermeiro = { id: 2, nome_completo: 'Enf. Maria Santos' };

    console.log(`   ✅ Médico: ${medico.nome_completo} (ID: ${medico.id})`);
    console.log(`   ✅ Enfermeiro: ${enfermeiro.nome_completo} (ID: ${enfermeiro.id})\n`);

    // 2. Criar ambulâncias
    console.log('🚑 Criando ambulâncias...');
    const ambulancias = [
      {
        marca: 'Fiat',
        modelo: 'Ducato',
        ano: 2022,
        motor: '2.3',
        placa: 'ABC1234',
        kilometragem: 50000,
        kilometragem_proxima_revisao: 60000,
        status_ambulancia: 'PRONTA',
        tipo_atual: 'EMERGENCIA',
      },
      {
        marca: 'Mercedes',
        modelo: 'Sprinter',
        ano: 2023,
        motor: '2.2',
        placa: 'DEF5678',
        kilometragem: 30000,
        kilometragem_proxima_revisao: 40000,
        status_ambulancia: 'PRONTA',
        tipo_atual: 'BASICA',
      },
    ];

    const { data: ambulanciasData, error: ambulanciasError } = await supabase
      .from('ambulancias')
      .upsert(ambulancias, { onConflict: 'placa' })
      .select();

    if (ambulanciasError) throw ambulanciasError;
    console.log(`   ✅ ${ambulanciasData?.length} ambulâncias criadas\n`);

    // 3. Criar ocorrências
    console.log('📅 Criando ocorrências...');

    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const depoisDeAmanha = new Date(hoje);
    depoisDeAmanha.setDate(hoje.getDate() + 2);

    const ocorrencias = [
      {
        numero_ocorrencia: 'OC-2025-001',
        tipo_trabalho: 'EVENTO',
        tipo_ambulancia: 'EMERGENCIA',
        data_ocorrencia: amanha.toISOString().split('T')[0],
        horario_saida: '08:00',
        horario_no_local: '09:00',
        horario_termino: '18:00',
        local_ocorrencia: 'Estádio Municipal - Av. Paulista, 1000',
        endereco_completo: 'Av. Paulista, 1000 - São Paulo, SP',
        descricao: 'Cobertura médica para evento esportivo',
        status: 'EM_ABERTO',
        carga_horaria: 10.0,
      },
      {
        numero_ocorrencia: 'OC-2025-002',
        tipo_trabalho: 'EMERGENCIA',
        tipo_ambulancia: 'EMERGENCIA',
        data_ocorrencia: amanha.toISOString().split('T')[0],
        horario_saida: '14:00',
        horario_no_local: '14:30',
        local_ocorrencia: 'Rua das Flores, 500 - Centro',
        endereco_completo: 'Rua das Flores, 500 - Centro - São Paulo, SP',
        descricao: 'Atendimento de emergência',
        status: 'EM_ABERTO',
      },
      {
        numero_ocorrencia: 'OC-2025-003',
        tipo_trabalho: 'DOMICILIAR',
        tipo_ambulancia: 'BASICA',
        data_ocorrencia: depoisDeAmanha.toISOString().split('T')[0],
        horario_saida: '10:00',
        horario_no_local: '10:30',
        local_ocorrencia: 'Rua das Acácias, 123 - Jardim Botânico',
        endereco_completo: 'Rua das Acácias, 123 - Jardim Botânico - São Paulo, SP',
        descricao: 'Atendimento domiciliar',
        status: 'EM_ABERTO',
      },
      {
        numero_ocorrencia: 'OC-2025-004',
        tipo_trabalho: 'TRANSFERENCIA',
        tipo_ambulancia: 'EMERGENCIA',
        data_ocorrencia: depoisDeAmanha.toISOString().split('T')[0],
        horario_saida: '15:00',
        horario_no_local: '15:30',
        local_ocorrencia: 'Hospital São Lucas - Rua Principal, 800',
        endereco_completo: 'Rua Principal, 800 - São Paulo, SP',
        descricao: 'Transferência de paciente para outro hospital',
        status: 'EM_ABERTO',
      },
    ];

    const { data: ocorrenciasData, error: ocorrenciasError } = await supabase
      .from('ocorrencias')
      .upsert(ocorrencias, { onConflict: 'numero_ocorrencia' })
      .select();

    if (ocorrenciasError) throw ocorrenciasError;
    console.log(`   ✅ ${ocorrenciasData?.length} ocorrências criadas\n`);

    // 4. Criar vagas (participantes)
    console.log('👥 Criando vagas para profissionais...');

    const vagas = [];

    for (const ocorrencia of ocorrenciasData || []) {
      if (ocorrencia.tipo_ambulancia === 'EMERGENCIA') {
        // 1 médico + 1 enfermeiro
        vagas.push({
          ocorrencia_id: ocorrencia.id,
          tipo_profissional: 'MEDICO',
          vaga_disponivel: true,
          confirmado: false,
          valor_pago: 500.0,
        });
        vagas.push({
          ocorrencia_id: ocorrencia.id,
          tipo_profissional: 'ENFERMEIRO',
          vaga_disponivel: true,
          confirmado: false,
          valor_pago: 300.0,
        });
      } else if (ocorrencia.tipo_ambulancia === 'BASICA') {
        // 1 enfermeiro
        vagas.push({
          ocorrencia_id: ocorrencia.id,
          tipo_profissional: 'ENFERMEIRO',
          vaga_disponivel: true,
          confirmado: false,
          valor_pago: 300.0,
        });
      }
    }

    const { data: vagasData, error: vagasError } = await supabase
      .from('ocorrencias_participantes')
      .insert(vagas)
      .select();

    if (vagasError) throw vagasError;
    console.log(`   ✅ ${vagasData?.length} vagas criadas\n`);

    // 5. Confirmar médico em uma ocorrência (para testar "confirmadas")
    console.log('✅ Confirmando médico em uma ocorrência...');
    const primeiraVagaMedico = vagasData?.find((v) => v.tipo_profissional === 'MEDICO');

    if (primeiraVagaMedico) {
      const { error: updateError } = await supabase
        .from('ocorrencias_participantes')
        .update({
          usuario_id: medico.id,
          confirmado: true,
          vaga_disponivel: false,
          data_confirmacao: new Date().toISOString(),
        })
        .eq('id', primeiraVagaMedico.id);

      if (updateError) throw updateError;
      console.log(`   ✅ Médico confirmado na ocorrência ${primeiraVagaMedico.ocorrencia_id}\n`);
    }

    console.log('✨ Seed concluído com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`   - ${ambulanciasData?.length} ambulâncias`);
    console.log(`   - ${ocorrenciasData?.length} ocorrências`);
    console.log(`   - ${vagasData?.length} vagas`);
    console.log(`   - 1 médico confirmado\n`);
    console.log('🧪 Acesse o dashboard do médico para ver as ocorrências!');
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
  }
}

seedTestData();
