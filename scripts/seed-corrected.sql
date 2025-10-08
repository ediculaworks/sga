-- ============================================
-- SEED DE DADOS DE TESTE - CORRIGIDO
-- ============================================

-- ====================
-- 1. AMBULÂNCIAS
-- ====================

INSERT INTO ambulancias (marca, modelo, ano, motor, placa, kilometragem, kilometragem_proxima_revisao, status_ambulancia, tipo_atual)
VALUES
  ('Fiat', 'Ducato', 2022, '2.3', 'ABC1234', 50000, 60000, 'PRONTA', 'EMERGENCIA'),
  ('Mercedes', 'Sprinter', 2023, '2.2', 'DEF5678', 30000, 40000, 'PRONTA', 'BASICA')
ON CONFLICT (placa) DO UPDATE SET
  marca = EXCLUDED.marca,
  modelo = EXCLUDED.modelo;

-- ====================
-- 2. USUÁRIO CRIADOR (usar ID 1 como médico criador)
-- ====================
-- Assumindo que já existe usuário com ID 1

-- ====================
-- 3. OCORRÊNCIAS
-- ====================

DO $$
DECLARE
  data_amanha DATE := CURRENT_DATE + INTERVAL '1 day';
  data_depois DATE := CURRENT_DATE + INTERVAL '2 days';
  criador_id INTEGER := 1; -- ID do médico
BEGIN

-- Ocorrência 1: Evento (amanhã)
INSERT INTO ocorrencias (
  numero_ocorrencia, tipo_trabalho, tipo_ambulancia, data_ocorrencia,
  horario_saida, horario_chegada_local, horario_termino, local_ocorrencia,
  endereco_completo, descricao, status_ocorrencia, carga_horaria, criado_por
) VALUES (
  'OC-2025-001', 'EVENTO', 'EMERGENCIA', data_amanha,
  '08:00', '09:00', '18:00', 'Estádio Municipal - Av. Paulista, 1000',
  'Av. Paulista, 1000 - São Paulo, SP', 'Cobertura médica para evento esportivo',
  'EM_ABERTO', 10, criador_id
) ON CONFLICT (numero_ocorrencia) DO NOTHING;

-- Ocorrência 2: Emergência (amanhã)
INSERT INTO ocorrencias (
  numero_ocorrencia, tipo_trabalho, tipo_ambulancia, data_ocorrencia,
  horario_saida, horario_chegada_local, local_ocorrencia, endereco_completo,
  descricao, status_ocorrencia, criado_por
) VALUES (
  'OC-2025-002', 'EMERGENCIA', 'EMERGENCIA', data_amanha,
  '14:00', '14:30', 'Rua das Flores, 500 - Centro',
  'Rua das Flores, 500 - Centro - São Paulo, SP', 'Atendimento de emergência',
  'EM_ABERTO', criador_id
) ON CONFLICT (numero_ocorrencia) DO NOTHING;

-- Ocorrência 3: Domiciliar (depois de amanhã)
INSERT INTO ocorrencias (
  numero_ocorrencia, tipo_trabalho, tipo_ambulancia, data_ocorrencia,
  horario_saida, horario_chegada_local, local_ocorrencia, endereco_completo,
  descricao, status_ocorrencia, criado_por
) VALUES (
  'OC-2025-003', 'DOMICILIAR', 'BASICA', data_depois,
  '10:00', '10:30', 'Rua das Acácias, 123 - Jardim Botânico',
  'Rua das Acácias, 123 - Jardim Botânico - São Paulo, SP', 'Atendimento domiciliar',
  'EM_ABERTO', criador_id
) ON CONFLICT (numero_ocorrencia) DO NOTHING;

-- Ocorrência 4: Transferência (depois de amanhã)
INSERT INTO ocorrencias (
  numero_ocorrencia, tipo_trabalho, tipo_ambulancia, data_ocorrencia,
  horario_saida, horario_chegada_local, local_ocorrencia, endereco_completo,
  descricao, status_ocorrencia, criado_por
) VALUES (
  'OC-2025-004', 'TRANSFERENCIA', 'EMERGENCIA', data_depois,
  '15:00', '15:30', 'Hospital São Lucas - Rua Principal, 800',
  'Rua Principal, 800 - São Paulo, SP', 'Transferência de paciente para outro hospital',
  'EM_ABERTO', criador_id
) ON CONFLICT (numero_ocorrencia) DO NOTHING;

END $$;

-- ====================
-- 4. VAGAS (PARTICIPANTES)
-- ====================

-- IMPORTANTE: A tabela usa 'funcao' ao invés de 'tipo_profissional'
-- e 'valor_pagamento' ao invés de 'valor_pago'

-- Criar vagas de médico para ambulâncias de emergência
INSERT INTO ocorrencias_participantes (ocorrencia_id, usuario_id, funcao, valor_pagamento, confirmado, pago)
SELECT
  o.id,
  1, -- ID do médico (será atualizado quando confirmar)
  'MEDICO'::tipo_perfil,
  500.0,
  false,
  false
FROM ocorrencias o
WHERE o.tipo_ambulancia = 'EMERGENCIA'
  AND o.numero_ocorrencia IN ('OC-2025-001', 'OC-2025-002', 'OC-2025-004')
  AND NOT EXISTS (
    SELECT 1 FROM ocorrencias_participantes op
    WHERE op.ocorrencia_id = o.id AND op.funcao = 'MEDICO'
  );

-- Criar vagas de enfermeiro para todas as ocorrências
INSERT INTO ocorrencias_participantes (ocorrencia_id, usuario_id, funcao, valor_pagamento, confirmado, pago)
SELECT
  o.id,
  2, -- ID do enfermeiro
  'ENFERMEIRO'::tipo_perfil,
  300.0,
  false,
  false
FROM ocorrencias o
WHERE o.numero_ocorrencia IN ('OC-2025-001', 'OC-2025-002', 'OC-2025-003', 'OC-2025-004')
  AND NOT EXISTS (
    SELECT 1 FROM ocorrencias_participantes op
    WHERE op.ocorrencia_id = o.id AND op.funcao = 'ENFERMEIRO'
  );

-- ====================
-- 5. CONFIRMAR MÉDICO EM UMA OCORRÊNCIA
-- ====================

-- Confirmar médico na primeira ocorrência (para teste de "confirmadas")
UPDATE ocorrencias_participantes
SET
  confirmado = true,
  data_confirmacao = NOW()
WHERE id = (
  SELECT MIN(id) FROM ocorrencias_participantes
  WHERE funcao = 'MEDICO'
);

-- Atualizar status da ocorrência para CONFIRMADA se todos confirmaram
UPDATE ocorrencias o
SET status_ocorrencia = 'CONFIRMADA'
WHERE EXISTS (
  SELECT 1 FROM ocorrencias_participantes op
  WHERE op.ocorrencia_id = o.id
    AND op.confirmado = true
)
AND o.numero_ocorrencia = 'OC-2025-001';

-- ====================
-- VERIFICAÇÃO
-- ====================

SELECT 'RESUMO DOS DADOS CRIADOS' as titulo;

SELECT 'Ambulâncias' as tipo, COUNT(*) as total FROM ambulancias;
SELECT 'Ocorrências' as tipo, COUNT(*) as total FROM ocorrencias;
SELECT 'Participantes (total)' as tipo, COUNT(*) as total FROM ocorrencias_participantes;
SELECT 'Participantes confirmados' as tipo, COUNT(*) as total FROM ocorrencias_participantes WHERE confirmado = true;

-- Listar ocorrências com detalhes
SELECT
  o.numero_ocorrencia,
  o.tipo_trabalho,
  o.tipo_ambulancia,
  o.data_ocorrencia,
  o.horario_saida,
  o.status_ocorrencia,
  COUNT(op.id) as total_vagas,
  SUM(CASE WHEN op.confirmado = true THEN 1 ELSE 0 END) as vagas_confirmadas
FROM ocorrencias o
LEFT JOIN ocorrencias_participantes op ON op.ocorrencia_id = o.id
GROUP BY o.id, o.numero_ocorrencia, o.tipo_trabalho, o.tipo_ambulancia, o.data_ocorrencia, o.horario_saida, o.status_ocorrencia
ORDER BY o.data_ocorrencia, o.horario_saida;
