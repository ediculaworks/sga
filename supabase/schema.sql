-- ============================================
-- PARTE 1: ENUMS E TABELAS DE USUÁRIOS
-- Execute esta parte primeiro
-- ============================================

-- ENUMS
CREATE TYPE tipo_perfil AS ENUM (
    'MEDICO',
    'ENFERMEIRO',
    'MOTORISTA',
    'CHEFE_MEDICOS',
    'CHEFE_ENFERMEIROS',
    'CHEFE_AMBULANCIAS'
);

CREATE TYPE status_ocorrencia AS ENUM (
    'EM_ABERTO',
    'CONFIRMADA',
    'EM_ANDAMENTO',
    'CONCLUIDA'
);

CREATE TYPE tipo_ambulancia AS ENUM (
    'BASICA',
    'EMERGENCIA'
);

CREATE TYPE tipo_trabalho AS ENUM (
    'EVENTO',
    'DOMICILIAR',
    'EMERGENCIA',
    'TRANSFERENCIA'
);

CREATE TYPE status_ambulancia AS ENUM (
    'PRONTA',
    'PENDENTE',
    'REVISAO',
    'EM_OPERACAO'
);

CREATE TYPE categoria_equipamento AS ENUM (
    'VIAS_AEREAS_AMBU',
    'EPI_INDIVIDUAL',
    'PROCEDIMENTO_PUNCAO',
    'MATERIAIS_ELETRICOS',
    'MATERIAL_AMB_GERAL',
    'SUTURA_BOLSA',
    'SONDAGEM_BOLSA'
);

CREATE TYPE sexo AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

-- TABELA: usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    senha_hash VARCHAR(255) NOT NULL,
    tipo_perfil tipo_perfil NOT NULL,
    idade INTEGER,
    sexo sexo,
    endereco_completo TEXT,
    data_admissao DATE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_tipo_perfil ON usuarios(tipo_perfil);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);

-- TABELA: motoristas
CREATE TABLE motoristas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cnh VARCHAR(20) UNIQUE NOT NULL,
    validade_cnh DATE NOT NULL,
    categoria_cnh VARCHAR(5) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_motoristas_usuario_id ON motoristas(usuario_id);

-- TABELA: escala
CREATE TABLE escala (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, data)
);

CREATE INDEX idx_escala_usuario_data ON escala(usuario_id, data);
CREATE INDEX idx_escala_data ON escala(data);
-- ============================================
-- PARTE 2: TABELAS DE AMBULÂNCIAS
-- Execute após a Parte 1
-- ============================================

-- TABELA: ambulancias
CREATE TABLE ambulancias (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    ano INTEGER NOT NULL,
    motor VARCHAR(50),
    kilometragem DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ultima_revisao DATE,
    proxima_revisao DATE,
    kilometragem_proxima_revisao DECIMAL(10, 2),
    status_ambulancia status_ambulancia DEFAULT 'PENDENTE',
    tipo_atual tipo_ambulancia,
    tablet_id VARCHAR(100) UNIQUE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ambulancias_status ON ambulancias(status_ambulancia);
CREATE INDEX idx_ambulancias_tipo ON ambulancias(tipo_atual);
CREATE INDEX idx_ambulancias_placa ON ambulancias(placa);

-- TABELA: equipamentos_catalogo
CREATE TABLE equipamentos_catalogo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria categoria_equipamento NOT NULL,
    tipo_ambulancia tipo_ambulancia NOT NULL,
    unidade_medida VARCHAR(50) DEFAULT 'unidade',
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipamentos_categoria ON equipamentos_catalogo(categoria);
CREATE INDEX idx_equipamentos_tipo ON equipamentos_catalogo(tipo_ambulancia);

-- TABELA: estoque_ambulancias
CREATE TABLE estoque_ambulancias (
    id SERIAL PRIMARY KEY,
    ambulancia_id INTEGER NOT NULL REFERENCES ambulancias(id) ON DELETE CASCADE,
    equipamento_id INTEGER NOT NULL REFERENCES equipamentos_catalogo(id) ON DELETE CASCADE,
    quantidade_atual DECIMAL(10, 2) NOT NULL DEFAULT 0,
    quantidade_minima DECIMAL(10, 2) DEFAULT 0,
    ultima_verificacao TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ambulancia_id, equipamento_id)
);

CREATE INDEX idx_estoque_ambulancia ON estoque_ambulancias(ambulancia_id);
CREATE INDEX idx_estoque_equipamento ON estoque_ambulancias(equipamento_id);

-- TABELA: gastos_ambulancias
CREATE TABLE gastos_ambulancias (
    id SERIAL PRIMARY KEY,
    ambulancia_id INTEGER NOT NULL REFERENCES ambulancias(id) ON DELETE CASCADE,
    tipo_gasto VARCHAR(100) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    descricao TEXT,
    data_gasto DATE NOT NULL,
    registrado_por INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gastos_ambulancia ON gastos_ambulancias(ambulancia_id);
CREATE INDEX idx_gastos_data ON gastos_ambulancias(data_gasto);
CREATE INDEX idx_gastos_tipo ON gastos_ambulancias(tipo_gasto);
-- ============================================
-- PARTE 3: TABELAS DE CHECKLISTS
-- Execute após a Parte 2
-- ============================================

-- TABELA: checklist_tecnico_ambulancias
CREATE TABLE checklist_tecnico_ambulancias (
    id SERIAL PRIMARY KEY,
    ambulancia_id INTEGER NOT NULL REFERENCES ambulancias(id) ON DELETE CASCADE,
    verificado_por INTEGER NOT NULL REFERENCES usuarios(id),
    data_verificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gasolina_ok BOOLEAN DEFAULT FALSE,
    kilometragem_registrada DECIMAL(10, 2),
    temperatura_ok BOOLEAN DEFAULT FALSE,
    pressao_pneus_ok BOOLEAN DEFAULT FALSE,
    revisao_ok BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    aprovado BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_checklist_tecnico_ambulancia ON checklist_tecnico_ambulancias(ambulancia_id);
CREATE INDEX idx_checklist_tecnico_data ON checklist_tecnico_ambulancias(data_verificacao);

-- TABELA: checklist_equipamentos_ambulancias
CREATE TABLE checklist_equipamentos_ambulancias (
    id SERIAL PRIMARY KEY,
    ambulancia_id INTEGER NOT NULL REFERENCES ambulancias(id) ON DELETE CASCADE,
    verificado_por INTEGER NOT NULL REFERENCES usuarios(id),
    data_verificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_definido tipo_ambulancia NOT NULL,
    observacoes TEXT,
    aprovado BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_checklist_equip_ambulancia ON checklist_equipamentos_ambulancias(ambulancia_id);
CREATE INDEX idx_checklist_equip_data ON checklist_equipamentos_ambulancias(data_verificacao);

-- TABELA: checklist_equipamentos_itens
CREATE TABLE checklist_equipamentos_itens (
    id SERIAL PRIMARY KEY,
    checklist_id INTEGER NOT NULL REFERENCES checklist_equipamentos_ambulancias(id) ON DELETE CASCADE,
    equipamento_id INTEGER NOT NULL REFERENCES equipamentos_catalogo(id),
    quantidade_verificada DECIMAL(10, 2) NOT NULL,
    quantidade_reposta DECIMAL(10, 2) DEFAULT 0,
    conforme BOOLEAN DEFAULT TRUE,
    observacoes TEXT
);

CREATE INDEX idx_checklist_itens_checklist ON checklist_equipamentos_itens(checklist_id);
-- ============================================
-- PARTE 4: TABELAS DE OCORRÊNCIAS
-- Execute após a Parte 3
-- ============================================

-- TABELA: ocorrencias
CREATE TABLE ocorrencias (
    id SERIAL PRIMARY KEY,
    numero_ocorrencia VARCHAR(50) UNIQUE NOT NULL,
    tipo_ambulancia tipo_ambulancia NOT NULL,
    tipo_trabalho tipo_trabalho NOT NULL,
    status_ocorrencia status_ocorrencia DEFAULT 'EM_ABERTO',
    descricao TEXT,
    local_ocorrencia TEXT NOT NULL,
    endereco_completo TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    data_ocorrencia DATE NOT NULL,
    horario_saida TIME NOT NULL,
    horario_chegada_local TIME,
    horario_termino TIME,
    carga_horaria INTEGER,
    criado_por INTEGER NOT NULL REFERENCES usuarios(id),
    ambulancia_id INTEGER REFERENCES ambulancias(id),
    motorista_id INTEGER REFERENCES usuarios(id),
    data_atribuicao TIMESTAMP,
    data_inicio TIMESTAMP,
    data_conclusao TIMESTAMP,
    duracao_total INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ocorrencias_status ON ocorrencias(status_ocorrencia);
CREATE INDEX idx_ocorrencias_tipo ON ocorrencias(tipo_trabalho);
CREATE INDEX idx_ocorrencias_data ON ocorrencias(data_ocorrencia);
CREATE INDEX idx_ocorrencias_ambulancia ON ocorrencias(ambulancia_id);
CREATE INDEX idx_ocorrencias_numero ON ocorrencias(numero_ocorrencia);

-- TABELA: ocorrencias_participantes
CREATE TABLE ocorrencias_participantes (
    id SERIAL PRIMARY KEY,
    ocorrencia_id INTEGER NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    funcao tipo_perfil NOT NULL,
    valor_pagamento DECIMAL(10, 2),
    data_pagamento DATE,
    pago BOOLEAN DEFAULT FALSE,
    confirmado BOOLEAN DEFAULT FALSE,
    data_confirmacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ocorrencia_id, usuario_id)
);

CREATE INDEX idx_participantes_ocorrencia ON ocorrencias_participantes(ocorrencia_id);
CREATE INDEX idx_participantes_usuario ON ocorrencias_participantes(usuario_id);
CREATE INDEX idx_participantes_pago ON ocorrencias_participantes(pago);
-- ============================================
-- PARTE 5: TABELAS DE PACIENTES E ATENDIMENTOS
-- Execute após a Parte 4
-- ============================================

-- TABELA: pacientes
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    idade INTEGER,
    sexo sexo,
    telefone VARCHAR(20),
    endereco_completo TEXT,
    contato_emergencia VARCHAR(255),
    telefone_emergencia VARCHAR(20),
    observacoes_gerais TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pacientes_nome ON pacientes(nome_completo);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);

-- TABELA: atendimentos
CREATE TABLE atendimentos (
    id SERIAL PRIMARY KEY,
    ocorrencia_id INTEGER NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
    medico_id INTEGER REFERENCES usuarios(id),
    data_atendimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    queixa_principal TEXT,
    quadro_clinico TEXT,
    procedimentos_realizados TEXT,
    diagnostico TEXT,
    remocao BOOLEAN DEFAULT FALSE,
    hospital_destino VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_atendimentos_ocorrencia ON atendimentos(ocorrencia_id);
CREATE INDEX idx_atendimentos_paciente ON atendimentos(paciente_id);
CREATE INDEX idx_atendimentos_medico ON atendimentos(medico_id);
CREATE INDEX idx_atendimentos_data ON atendimentos(data_atendimento);

-- TABELA: atendimentos_arquivos
CREATE TABLE atendimentos_arquivos (
    id SERIAL PRIMARY KEY,
    atendimento_id INTEGER NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
    tipo_arquivo VARCHAR(50) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo TEXT NOT NULL,
    tamanho_bytes BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_arquivos_atendimento ON atendimentos_arquivos(atendimento_id);

-- TABELA: notas_enfermeiro_pacientes
CREATE TABLE notas_enfermeiro_pacientes (
    id SERIAL PRIMARY KEY,
    atendimento_id INTEGER NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
    enfermeiro_id INTEGER NOT NULL REFERENCES usuarios(id),
    nota TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notas_atendimento ON notas_enfermeiro_pacientes(atendimento_id);
CREATE INDEX idx_notas_enfermeiro ON notas_enfermeiro_pacientes(enfermeiro_id);

-- TABELA: consumo_materiais
CREATE TABLE consumo_materiais (
    id SERIAL PRIMARY KEY,
    ocorrencia_id INTEGER NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE,
    ambulancia_id INTEGER NOT NULL REFERENCES ambulancias(id),
    equipamento_id INTEGER NOT NULL REFERENCES equipamentos_catalogo(id),
    quantidade_utilizada DECIMAL(10, 2) NOT NULL,
    registrado_por INTEGER NOT NULL REFERENCES usuarios(id),
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consumo_ocorrencia ON consumo_materiais(ocorrencia_id);
CREATE INDEX idx_consumo_ambulancia ON consumo_materiais(ambulancia_id);
CREATE INDEX idx_consumo_equipamento ON consumo_materiais(equipamento_id);
-- ============================================
-- PARTE 6: TABELAS DE SISTEMA
-- Execute após a Parte 5
-- ============================================

-- TABELA: notificacoes
CREATE TABLE notificacoes (
    id SERIAL PRIMARY KEY,
    remetente_id INTEGER REFERENCES usuarios(id),
    destinatario_id INTEGER REFERENCES usuarios(id),
    ocorrencia_id INTEGER REFERENCES ocorrencias(id),
    tipo_notificacao VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    data_leitura TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notificacoes_destinatario ON notificacoes(destinatario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_data ON notificacoes(created_at);

-- TABELA: rastreamento_ambulancias
CREATE TABLE rastreamento_ambulancias (
    id SERIAL PRIMARY KEY,
    ambulancia_id INTEGER NOT NULL REFERENCES ambulancias(id) ON DELETE CASCADE,
    ocorrencia_id INTEGER REFERENCES ocorrencias(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    velocidade DECIMAL(5, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rastreamento_ambulancia ON rastreamento_ambulancias(ambulancia_id);
CREATE INDEX idx_rastreamento_timestamp ON rastreamento_ambulancias(timestamp);
CREATE INDEX idx_rastreamento_ocorrencia ON rastreamento_ambulancias(ocorrencia_id);

-- TABELA: logs_sistema
CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(100),
    registro_id INTEGER,
    descricao TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_usuario ON logs_sistema(usuario_id);
CREATE INDEX idx_logs_acao ON logs_sistema(acao);
CREATE INDEX idx_logs_data ON logs_sistema(created_at);
-- ============================================
-- PARTE 7: TRIGGERS BÁSICOS
-- Execute após a Parte 6
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_motoristas_updated_at BEFORE UPDATE ON motoristas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escala_updated_at BEFORE UPDATE ON escala
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ambulancias_updated_at BEFORE UPDATE ON ambulancias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipamentos_updated_at BEFORE UPDATE ON equipamentos_catalogo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estoque_updated_at BEFORE UPDATE ON estoque_ambulancias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ocorrencias_updated_at BEFORE UPDATE ON ocorrencias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_atendimentos_updated_at BEFORE UPDATE ON atendimentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    -- ============================================
-- PARTE 8: TRIGGERS DE LÓGICA DE NEGÓCIO
-- Execute após a Parte 7
-- ============================================

-- Trigger: Atualizar estoque após consumo
CREATE OR REPLACE FUNCTION atualizar_estoque_apos_consumo()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE estoque_ambulancias
    SET quantidade_atual = quantidade_atual - NEW.quantidade_utilizada,
        updated_at = CURRENT_TIMESTAMP
    WHERE ambulancia_id = NEW.ambulancia_id
    AND equipamento_id = NEW.equipamento_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_estoque
AFTER INSERT ON consumo_materiais
FOR EACH ROW
EXECUTE FUNCTION atualizar_estoque_apos_consumo();

-- Trigger: Mudar status ambulância para PENDENTE após retorno
CREATE OR REPLACE FUNCTION mudar_status_ambulancia_apos_conclusao()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status_ocorrencia = 'CONCLUIDA' AND OLD.status_ocorrencia != 'CONCLUIDA' THEN
        UPDATE ambulancias
        SET status_ambulancia = 'PENDENTE',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.ambulancia_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_status_ambulancia_conclusao
AFTER UPDATE ON ocorrencias
FOR EACH ROW
EXECUTE FUNCTION mudar_status_ambulancia_apos_conclusao();

-- Trigger: Verificar kilometragem para revisão
CREATE OR REPLACE FUNCTION verificar_revisao_ambulancia()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.kilometragem >= NEW.kilometragem_proxima_revisao THEN
        NEW.status_ambulancia = 'REVISAO';
        
        INSERT INTO notificacoes (tipo_notificacao, titulo, mensagem)
        VALUES (
            'MANUTENCAO',
            'Ambulância necessita revisão',
            'A ambulância ' || NEW.placa || ' atingiu a kilometragem para revisão.'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_verificar_revisao
BEFORE UPDATE ON ambulancias
FOR EACH ROW
EXECUTE FUNCTION verificar_revisao_ambulancia();

-- Trigger: Calcular duração total da ocorrência
CREATE OR REPLACE FUNCTION calcular_duracao_ocorrencia()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status_ocorrencia = 'CONCLUIDA' AND NEW.data_inicio IS NOT NULL AND NEW.data_conclusao IS NOT NULL THEN
        NEW.duracao_total = EXTRACT(EPOCH FROM (NEW.data_conclusao - NEW.data_inicio)) / 60;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_duracao
BEFORE UPDATE ON ocorrencias
FOR EACH ROW
EXECUTE FUNCTION calcular_duracao_ocorrencia();

-- Trigger: Mudar status ocorrência para CONFIRMADA automaticamente
CREATE OR REPLACE FUNCTION verificar_ocorrencia_confirmada()
RETURNS TRIGGER AS $$
DECLARE
    vagas_necessarias INTEGER;
    vagas_preenchidas INTEGER;
    tipo_amb tipo_ambulancia;
BEGIN
    SELECT tipo_ambulancia INTO tipo_amb FROM ocorrencias WHERE id = NEW.ocorrencia_id;
    
    IF tipo_amb = 'BASICA' THEN
        vagas_necessarias := 1;
    ELSE
        vagas_necessarias := 2;
    END IF;
    
    SELECT COUNT(*) INTO vagas_preenchidas
    FROM ocorrencias_participantes
    WHERE ocorrencia_id = NEW.ocorrencia_id AND confirmado = TRUE;
    
    IF vagas_preenchidas >= vagas_necessarias THEN
        UPDATE ocorrencias
        SET status_ocorrencia = 'CONFIRMADA',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.ocorrencia_id AND status_ocorrencia = 'EM_ABERTO';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_verificar_confirmacao
AFTER INSERT OR UPDATE ON ocorrencias_participantes
FOR EACH ROW
WHEN (NEW.confirmado = TRUE)
EXECUTE FUNCTION verificar_ocorrencia_confirmada();
-- ============================================
-- PARTE 9: VIEWS PARA RELATÓRIOS (FINAL)
-- Execute após a Parte 8
-- ============================================

-- View: Resumo de ocorrências por período
CREATE VIEW vw_resumo_ocorrencias AS
SELECT 
    DATE_TRUNC('month', data_ocorrencia) as mes,
    tipo_trabalho,
    tipo_ambulancia,
    status_ocorrencia,
    COUNT(*) as total_ocorrencias,
    AVG(duracao_total) as duracao_media_minutos
FROM ocorrencias
GROUP BY DATE_TRUNC('month', data_ocorrencia), tipo_trabalho, tipo_ambulancia, status_ocorrencia;

-- View: Estatísticas por ambulância
CREATE VIEW vw_estatisticas_ambulancias AS
SELECT 
    a.id,
    a.placa,
    a.modelo,
    a.status_ambulancia,
    COUNT(DISTINCT o.id) as total_ocorrencias,
    SUM(CASE WHEN o.tipo_trabalho = 'EMERGENCIA' THEN 1 ELSE 0 END) as total_emergencias,
    SUM(CASE WHEN o.tipo_trabalho = 'EVENTO' THEN 1 ELSE 0 END) as total_eventos,
    SUM(CASE WHEN o.tipo_trabalho = 'DOMICILIAR' THEN 1 ELSE 0 END) as total_domiciliar,
    SUM(CASE WHEN o.tipo_trabalho = 'TRANSFERENCIA' THEN 1 ELSE 0 END) as total_transferencias,
    COALESCE(SUM(g.valor), 0) as total_gastos
FROM ambulancias a
LEFT JOIN ocorrencias o ON a.id = o.ambulancia_id
LEFT JOIN gastos_ambulancias g ON a.id = g.ambulancia_id
GROUP BY a.id, a.placa, a.modelo, a.status_ambulancia;

-- View: Profissionais disponíveis por data
CREATE VIEW vw_profissionais_disponiveis AS
SELECT 
    e.data,
    u.id as usuario_id,
    u.nome_completo,
    u.tipo_perfil,
    e.disponivel,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM ocorrencias_participantes op
            JOIN ocorrencias o ON op.ocorrencia_id = o.id
            WHERE op.usuario_id = u.id 
            AND o.data_ocorrencia = e.data
            AND o.status_ocorrencia IN ('CONFIRMADA', 'EM_ANDAMENTO')
        ) THEN FALSE
        ELSE TRUE
    END as livre_para_ocorrencias
FROM escala e
JOIN usuarios u ON e.usuario_id = u.id
WHERE u.tipo_perfil IN ('MEDICO', 'ENFERMEIRO')
AND u.ativo = TRUE;

-- View: Estoque baixo de equipamentos
CREATE VIEW vw_estoque_baixo AS
SELECT 
    a.placa,
    ec.nome as equipamento,
    ec.categoria,
    ea.quantidade_atual,
    ea.quantidade_minima,
    (ea.quantidade_minima - ea.quantidade_atual) as quantidade_a_repor
FROM estoque_ambulancias ea
JOIN ambulancias a ON ea.ambulancia_id = a.id
JOIN equipamentos_catalogo ec ON ea.equipamento_id = ec.id
WHERE ea.quantidade_atual < ea.quantidade_minima;

-- View: Pagamentos pendentes
CREATE VIEW vw_pagamentos_pendentes AS
SELECT 
    o.numero_ocorrencia,
    o.data_ocorrencia,
    o.tipo_trabalho,
    u.nome_completo as profissional,
    u.tipo_perfil,
    op.valor_pagamento,
    op.data_pagamento
FROM ocorrencias_participantes op
JOIN ocorrencias o ON op.ocorrencia_id = o.id
JOIN usuarios u ON op.usuario_id = u.id
WHERE op.pago = FALSE
AND o.status_ocorrencia = 'CONCLUIDA'
ORDER BY op.data_pagamento;