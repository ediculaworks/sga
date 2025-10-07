import { NextResponse } from 'next/server';

/**
 * Rota API de health check
 *
 * Esta rota serve para verificar se a API está funcionando.
 * GET /api/health
 */

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Sistema de Gestão de Ambulâncias',
  });
}
