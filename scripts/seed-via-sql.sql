-- ============================================
-- SEED DE DADOS DE TESTE - VIA SQL DIRETO
-- ============================================
-- Popula banco com dados de teste para desenvolvimento

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
-- 2. OCORRÊNCIAS
-- ====================

-- Calcular datas
DO $$
DECLARE
  data_amanha DATE := CURRENT_DATE + INTERVAL '1 day';
  data_depois DATE := CURRENT_DATE + INTERVAL '2 days';
BEGIN

-- Ocorrência 1: Evento (amanhã)
INSERT INTO ocorrencias (
  numero_ocorrencia, tipo_trabalho, tipo_ambulancia, data_ocorrencia,
  horario_saida, horario_no_local, horario_termino, local_ocorrencia,
  endereco_completo, descricao, status, carga_horaria
) VALUES (
  'OC-2025-001', 'EVENTO', 'EMERGENCIA', data_amanha,
  '08:00', '09:00', '18:00', 'Estádio Municipal - Av. Paulista, 1000',
  'Av. Paulista, 1000 - São Paulo, SP', 'Cobertura médica para evento esportivo',
  'EM_ABERTO', 10.0
) ON CONFLICT (numero_ocorrencia) DO NOTHING;

-- Ocorrência 2: Emergência (amanhã)
INSERT INTO ocorrencias (
  numero_ocorrencia, tipo_trabalho, tipo_ambulancia, data_ocorrencia,
  horario_saida, horario_no_local, local_ocorrencia, endereco_completo,
  descricao, status
) VALUES (
  'OC-2025-002', 'EMERGENCIA', 'EMERGENCIA', data_amanha,
  '14:00', '14:30', 'Rua das Flores, 500 - Centro',
  'Rua das Flores, 500 - Centro - São Paulo, SP', 'Atendimento de emergência',
  'EM_ABERTO'
) ON CONFLICT (numero_ocorrencia) DO NOTHING;

-- Ocorrência 3: Domiciliar (depois de amanhã)
INSERT INTO ocorrencias (
  numero_ocorrencia, tipo_trabalho, tipo_ambulancia, data_ocorrencia,
  horario_saida, horario_no_local, local_ocorrencia, endereco_completo,
  descricao, status
) VALUES (
  'OC-2025-003', 'DOMICILIAR', 'BASICA', data_depois,
  '10:00', '10:30', 'Rua das Acácias, 123 - Jardim Botânico',
  'Rua das Acácias, 123 - Jardim Botânico - São Paulo, SP', 'Atendimento domiciliar',
  'EM_ABERTO'
) ON CONFLICT (numero_ocorrencia) DO NOTHING;

-- Ocorrência 4: Transferência (depois de amanhã)
INSERT INTO ocorrencias (
  numero_ocorrencia, tipo_trabalho, tipo_ambulancia, data_ocorrencia,
  horario_saida, horario_no_local, local_ocorrencia, endereco_completo,
  descricao, status
) VALUES (
  'OC-2025-004', 'TRANSFERENCIA', 'EMERGENCIA', data_depois,
  '15:00', '15:30', 'Hospital São Lucas - Rua Principal, 800',
  'Rua Principal, 800 - São Paulo, SP', 'Transferência de paciente para outro hospital',
  'EM_ABERTO'
) ON CONFLICT (numero_ocorrencia) DO NOTHING;

END $$;

-- ====================
-- 3. VAGAS (PARTICIPANTES)
-- ====================

-- Criar vagas para cada ocorrência
INSERT INTO ocorrencias_participantes (ocorrencia_id, tipo_profissional, vaga_disponivel, confirmado, valor_pago)
SELECT
  o.id,
  'MEDICO',
  true,
  false,
  500.0
FROM ocorrencias o
WHERE o.tipo_ambulancia = 'EMERGENCIA'
  AND NOT EXISTS (
    SELECT 1 FROM ocorrencias_participantes op
    WHERE op.ocorrencia_id = o.id AND op.tipo_profissional = 'MEDICO'
  );

INSERT INTO ocorrencias_participantes (ocorrencia_id, tipo_profissional, vaga_disponivel, confirmado, valor_pago)
SELECT
  o.id,
  'ENFERMEIRO',
  true,
  false,
  300.0
FROM ocorrencias o
WHERE NOT EXISTS (
    SELECT 1 FROM ocorrencias_participantes op
    WHERE op.ocorrencia_id = o.id AND op.tipo_profissional = 'ENFERMEIRO'
  );

-- ====================
-- 4. CONFIRMAR MÉDICO EM UMA OCORRÊNCIA
-- ====================

-- Pegar a primeira vaga de médico e confirmar o usuário ID 1
UPDATE ocorrencias_participantes
SET
  usuario_id = 1,
  confirmado = true,
  vaga_disponivel = false,
  data_confirmacao = NOW()
WHERE id = (
  SELECT id FROM ocorrencias_participantes
  WHERE tipo_profissional = 'MEDICO'
    AND confirmado = false
  LIMIT 1
);

-- ====================
-- VERIFICAÇÃO
-- ====================

SELECT
  'Ambulâncias criadas' as "Tipo",
  COUNT(*) as total
FROM ambulancias;

SELECT
  'Ocorrências criadas' as "Tipo",
  COUNT(*) as total
FROM ocorrencias;

SELECT
  'Vagas criadas' as "Tipo",
  COUNT(*) as total
FROM ocorrencias_participantes;

SELECT
  'Vagas confirmadas' as "Tipo",
  COUNT(*) as total
FROM ocorrencias_participantes
WHERE confirmado = true;

-- Listar ocorrências
SELECT
  numero_ocorrencia,
  tipo_trabalho,
  data_ocorrencia,
  status,
  (SELECT COUNT(*) FROM ocorrencias_participantes op WHERE op.ocorrencia_id = o.id) as vagas
FROM ocorrencias o
ORDER BY data_ocorrencia, horario_saida;
