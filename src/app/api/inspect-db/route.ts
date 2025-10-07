import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Listar todas as tabelas do schema public
    const { data: tables, error: tablesError } = await supabaseServer.rpc(
      'exec_sql',
      {
        sql: `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `,
      }
    );

    // Se a função não existir, tenta outra abordagem
    if (tablesError) {
      // Tenta consultar diretamente algumas tabelas comuns
      const tablesToCheck = [
        'profiles',
        'ambulancias',
        'motoristas',
        'ocorrencias',
        'usuarios',
        'veiculos',
        'atendimentos',
        'pacientes',
      ];

      const existingTables = [];
      const tableStructures: any = {};

      for (const tableName of tablesToCheck) {
        const { data, error } = await supabaseServer
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          existingTables.push(tableName);

          // Pegar estrutura da tabela
          if (data && data.length > 0) {
            tableStructures[tableName] = {
              columns: Object.keys(data[0]),
              sampleData: data[0],
            };
          } else {
            // Tabela existe mas está vazia, pegar só as colunas
            const { data: emptyData } = await supabaseServer
              .from(tableName)
              .select('*')
              .limit(0);
            tableStructures[tableName] = {
              columns: emptyData ? Object.keys(emptyData[0] || {}) : [],
              sampleData: null,
              isEmpty: true,
            };
          }
        }
      }

      return NextResponse.json({
        success: true,
        method: 'direct_check',
        tables: existingTables,
        tableStructures,
        message: `Encontradas ${existingTables.length} tabelas`,
      });
    }

    return NextResponse.json({
      success: true,
      method: 'rpc',
      tables,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
