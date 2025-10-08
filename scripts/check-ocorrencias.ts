/**
 * Script para verificar ocorrências no banco
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOcorrencias() {
  console.log('🔍 VERIFICANDO OCORRÊNCIAS NO BANCO\n');
  console.log('='.repeat(60) + '\n');

  // 1. Verificar permissões
  console.log('1️⃣  Verificando permissões RLS...');

  const { data: rlsData, error: rlsError } = await supabase
    .rpc('exec_sql', {
      query: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('ocorrencias', 'ocorrencias_participantes', 'escala');`
    });

  if (rlsError) {
    console.log('   ⚠️  Não foi possível verificar RLS via RPC');
  }

  // 2. Contar ocorrências
  console.log('\n2️⃣  Contando ocorrências...');
  const { count: totalOcorrencias, error: countError } = await supabase
    .from('ocorrencias')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('   ❌ Erro ao contar ocorrências:', countError.message);
    console.log('\n   💡 Permissões ainda não configuradas!');
    console.log('      Execute: scripts/fix-ocorrencias-permissions.sql no Supabase\n');
  } else {
    console.log(`   ✅ Total de ocorrências: ${totalOcorrencias}`);
  }

  // 3. Listar ocorrências (se houver)
  if (!countError && totalOcorrencias && totalOcorrencias > 0) {
    console.log('\n3️⃣  Listando ocorrências...\n');
    const { data: ocorrencias, error: listError } = await supabase
      .from('ocorrencias')
      .select('id, numero_ocorrencia, tipo_trabalho, data_ocorrencia, status')
      .limit(10);

    if (listError) {
      console.error('   ❌ Erro ao listar:', listError.message);
    } else {
      ocorrencias?.forEach((oc, index) => {
        console.log(`   [${index + 1}] ${oc.numero_ocorrencia}`);
        console.log(`       Tipo: ${oc.tipo_trabalho}`);
        console.log(`       Data: ${oc.data_ocorrencia}`);
        console.log(`       Status: ${oc.status}`);
        console.log('');
      });
    }
  }

  // 4. Verificar participantes
  console.log('4️⃣  Verificando participantes...');
  const { count: totalParticipantes, error: partError } = await supabase
    .from('ocorrencias_participantes')
    .select('*', { count: 'exact', head: true });

  if (partError) {
    console.error('   ❌ Erro:', partError.message);
  } else {
    console.log(`   ✅ Total de vagas/participantes: ${totalParticipantes}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMO:\n');

  if (countError || partError) {
    console.log('❌ STATUS: PERMISSÕES NÃO CONFIGURADAS');
    console.log('\n📋 AÇÃO NECESSÁRIA:');
    console.log('   1. Abra o Supabase SQL Editor');
    console.log('   2. Execute: scripts/fix-ocorrencias-permissions.sql');
    console.log('   3. Execute este script novamente\n');
  } else if (totalOcorrencias === 0) {
    console.log('⚠️  STATUS: SEM DADOS DE TESTE');
    console.log('\n📋 AÇÃO NECESSÁRIA:');
    console.log('   1. Execute: npx tsx scripts/seed-test-data.ts');
    console.log('   2. Recarregue o dashboard\n');
  } else {
    console.log('✅ STATUS: TUDO OK!');
    console.log(`   - ${totalOcorrencias} ocorrências cadastradas`);
    console.log(`   - ${totalParticipantes} vagas disponíveis`);
    console.log('\n🎉 Dashboard deve funcionar agora!\n');
  }
}

checkOcorrencias().catch(console.error);
