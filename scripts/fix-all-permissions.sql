-- ============================================
-- CORREÇÃO COMPLETA DE PERMISSÕES - TODAS AS TABELAS
-- ============================================
-- Configura permissões para todas as tabelas principais do sistema

-- ====================
-- USUÁRIOS E PERFIS
-- ====================

-- usuarios (já configurado, mas garantir)
GRANT SELECT ON usuarios TO anon, authenticated;
GRANT INSERT, UPDATE ON usuarios TO authenticated;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
CREATE POLICY "usuarios_select_own" ON usuarios FOR SELECT TO authenticated USING (email = auth.jwt()->>'email');

-- motoristas
GRANT SELECT ON motoristas TO anon, authenticated;
GRANT INSERT, UPDATE ON motoristas TO authenticated;
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "motoristas_select_all" ON motoristas;
CREATE POLICY "motoristas_select_all" ON motoristas FOR SELECT TO authenticated USING (true);

-- escala
GRANT SELECT, INSERT, UPDATE ON escala TO anon, authenticated;
ALTER TABLE escala ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "escala_select_all" ON escala;
CREATE POLICY "escala_select_all" ON escala FOR SELECT TO authenticated USING (true);

-- ====================
-- AMBULÂNCIAS
-- ====================

-- ambulancias
GRANT SELECT, INSERT, UPDATE ON ambulancias TO anon, authenticated;
ALTER TABLE ambulancias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ambulancias_select_all" ON ambulancias;
CREATE POLICY "ambulancias_select_all" ON ambulancias FOR SELECT TO authenticated USING (true);

-- equipamentos_catalogo
GRANT SELECT ON equipamentos_catalogo TO anon, authenticated;
ALTER TABLE equipamentos_catalogo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "equipamentos_select_all" ON equipamentos_catalogo;
CREATE POLICY "equipamentos_select_all" ON equipamentos_catalogo FOR SELECT TO authenticated USING (true);

-- estoque_ambulancias
GRANT SELECT, INSERT, UPDATE ON estoque_ambulancias TO anon, authenticated;
ALTER TABLE estoque_ambulancias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "estoque_select_all" ON estoque_ambulancias;
CREATE POLICY "estoque_select_all" ON estoque_ambulancias FOR SELECT TO authenticated USING (true);

-- gastos_ambulancias
GRANT SELECT, INSERT, UPDATE ON gastos_ambulancias TO anon, authenticated;
ALTER TABLE gastos_ambulancias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gastos_select_all" ON gastos_ambulancias;
CREATE POLICY "gastos_select_all" ON gastos_ambulancias FOR SELECT TO authenticated USING (true);

-- ====================
-- CHECKLISTS
-- ====================

-- checklist_tecnico_ambulancias
GRANT SELECT, INSERT, UPDATE ON checklist_tecnico_ambulancias TO anon, authenticated;
ALTER TABLE checklist_tecnico_ambulancias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checklist_tecnico_select_all" ON checklist_tecnico_ambulancias;
CREATE POLICY "checklist_tecnico_select_all" ON checklist_tecnico_ambulancias FOR SELECT TO authenticated USING (true);

-- checklist_equipamentos_ambulancias
GRANT SELECT, INSERT, UPDATE ON checklist_equipamentos_ambulancias TO anon, authenticated;
ALTER TABLE checklist_equipamentos_ambulancias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checklist_equipamentos_select_all" ON checklist_equipamentos_ambulancias;
CREATE POLICY "checklist_equipamentos_select_all" ON checklist_equipamentos_ambulancias FOR SELECT TO authenticated USING (true);

-- checklist_equipamentos_itens
GRANT SELECT, INSERT, UPDATE ON checklist_equipamentos_itens TO anon, authenticated;
ALTER TABLE checklist_equipamentos_itens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checklist_itens_select_all" ON checklist_equipamentos_itens;
CREATE POLICY "checklist_itens_select_all" ON checklist_equipamentos_itens FOR SELECT TO authenticated USING (true);

-- ====================
-- OCORRÊNCIAS
-- ====================

-- ocorrencias
GRANT SELECT, INSERT, UPDATE ON ocorrencias TO anon, authenticated;
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ocorrencias_select_all" ON ocorrencias;
CREATE POLICY "ocorrencias_select_all" ON ocorrencias FOR SELECT TO authenticated USING (true);

-- ocorrencias_participantes
GRANT SELECT, INSERT, UPDATE ON ocorrencias_participantes TO anon, authenticated;
ALTER TABLE ocorrencias_participantes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "participantes_select_all" ON ocorrencias_participantes;
CREATE POLICY "participantes_select_all" ON ocorrencias_participantes FOR SELECT TO authenticated USING (true);

-- ====================
-- PACIENTES E ATENDIMENTOS
-- ====================

-- pacientes
GRANT SELECT, INSERT, UPDATE ON pacientes TO anon, authenticated;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pacientes_select_all" ON pacientes;
CREATE POLICY "pacientes_select_all" ON pacientes FOR SELECT TO authenticated USING (true);

-- atendimentos
GRANT SELECT, INSERT, UPDATE ON atendimentos TO anon, authenticated;
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "atendimentos_select_all" ON atendimentos;
CREATE POLICY "atendimentos_select_all" ON atendimentos FOR SELECT TO authenticated USING (true);

-- atendimentos_arquivos
GRANT SELECT, INSERT, UPDATE ON atendimentos_arquivos TO anon, authenticated;
ALTER TABLE atendimentos_arquivos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "atendimentos_arquivos_select_all" ON atendimentos_arquivos;
CREATE POLICY "atendimentos_arquivos_select_all" ON atendimentos_arquivos FOR SELECT TO authenticated USING (true);

-- notas_enfermeiro_pacientes
GRANT SELECT, INSERT, UPDATE ON notas_enfermeiro_pacientes TO anon, authenticated;
ALTER TABLE notas_enfermeiro_pacientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notas_enfermeiro_select_all" ON notas_enfermeiro_pacientes;
CREATE POLICY "notas_enfermeiro_select_all" ON notas_enfermeiro_pacientes FOR SELECT TO authenticated USING (true);

-- consumo_materiais
GRANT SELECT, INSERT, UPDATE ON consumo_materiais TO anon, authenticated;
ALTER TABLE consumo_materiais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "consumo_materiais_select_all" ON consumo_materiais;
CREATE POLICY "consumo_materiais_select_all" ON consumo_materiais FOR SELECT TO authenticated USING (true);

-- ====================
-- SISTEMA
-- ====================

-- notificacoes
GRANT SELECT, INSERT, UPDATE ON notificacoes TO anon, authenticated;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notificacoes_select_own" ON notificacoes;
CREATE POLICY "notificacoes_select_own" ON notificacoes FOR SELECT TO authenticated USING (destinatario_id IN (SELECT id FROM usuarios WHERE email = auth.jwt()->>'email'));

-- rastreamento_ambulancias
GRANT SELECT, INSERT, UPDATE ON rastreamento_ambulancias TO anon, authenticated;
ALTER TABLE rastreamento_ambulancias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rastreamento_select_all" ON rastreamento_ambulancias;
CREATE POLICY "rastreamento_select_all" ON rastreamento_ambulancias FOR SELECT TO authenticated USING (true);

-- logs_sistema
GRANT SELECT, INSERT ON logs_sistema TO anon, authenticated;
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "logs_select_all" ON logs_sistema;
CREATE POLICY "logs_select_all" ON logs_sistema FOR SELECT TO authenticated USING (true);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

SELECT
    'Tabelas com RLS habilitado' as "Status",
    COUNT(*) as total
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

SELECT
    'Políticas criadas' as "Status",
    COUNT(*) as total
FROM pg_policies
WHERE schemaname = 'public';
