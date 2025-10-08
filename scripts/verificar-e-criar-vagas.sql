-- ============================================
-- VERIFICAR E CRIAR VAGAS PARA TESTES
-- ============================================

-- PASSO 1: Verificar ocorrências EM_ABERTO
SELECT
    'OCORRENCIAS EM_ABERTO' as secao,
    id,
    numero_ocorrencia,
    status_ocorrencia,
    tipo_trabalho,
    data_ocorrencia
FROM ocorrencias
WHERE status_ocorrencia = 'EM_ABERTO'
ORDER BY data_ocorrencia DESC
LIMIT 5;

-- PASSO 2: Verificar participantes dessas ocorrências
SELECT
    'PARTICIPANTES DAS OCORRENCIAS' as secao,
    op.id,
    op.ocorrencia_id,
    o.numero_ocorrencia,
    op.funcao,
    op.usuario_id,
    u.nome_completo,
    op.confirmado,
    op.data_confirmacao
FROM ocorrencias_participantes op
LEFT JOIN ocorrencias o ON o.id = op.ocorrencia_id
LEFT JOIN usuarios u ON u.id = op.usuario_id
WHERE o.status_ocorrencia = 'EM_ABERTO'
ORDER BY op.ocorrencia_id, op.funcao;

-- PASSO 3: Criar vagas vazias se necessário
-- Execute APENAS SE não houver vagas vazias

-- Exemplo: Criar 2 vagas vazias para ocorrência ID 1 (ajuste o ID conforme necessário)
/*
INSERT INTO ocorrencias_participantes (ocorrencia_id, funcao, confirmado, usuario_id)
VALUES
    (1, 'MEDICO', false, NULL),
    (1, 'ENFERMEIRO', false, NULL)
ON CONFLICT DO NOTHING;
*/

-- PASSO 4: Verificar resultado
SELECT
    'RESULTADO FINAL' as secao,
    op.ocorrencia_id,
    o.numero_ocorrencia,
    op.funcao,
    CASE
        WHEN op.usuario_id IS NULL THEN 'VAGA VAZIA'
        ELSE u.nome_completo
    END as status_vaga,
    op.confirmado
FROM ocorrencias_participantes op
LEFT JOIN ocorrencias o ON o.id = op.ocorrencia_id
LEFT JOIN usuarios u ON u.id = op.usuario_id
WHERE o.status_ocorrencia = 'EM_ABERTO'
ORDER BY op.ocorrencia_id, op.funcao;
