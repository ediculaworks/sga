-- =====================================================
-- SCHEMA DO BANCO DE DADOS - SISTEMA DE GESTÃO DE AMBULÂNCIAS
-- =====================================================
--
-- Este arquivo contém todas as tabelas, índices, triggers e políticas RLS
-- para o Sistema de Gestão de Ambulâncias (SGA)
--
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: profiles (estende auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    nome TEXT,
    role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'driver')),
    telefone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver seu próprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- TABELA: ambulancias
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ambulancias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placa TEXT NOT NULL UNIQUE,
    modelo TEXT NOT NULL,
    ano INTEGER NOT NULL CHECK (ano >= 1990 AND ano <= EXTRACT(YEAR FROM NOW()) + 1),
    tipo TEXT NOT NULL CHECK (tipo IN ('basica', 'uti_movel', 'resgate', 'suporte_avancado')),
    status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'em_uso', 'manutencao', 'inativa')),
    km_atual INTEGER DEFAULT 0,
    ultima_manutencao DATE,
    proxima_manutencao DATE,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ambulancias_status ON public.ambulancias(status);
CREATE INDEX idx_ambulancias_placa ON public.ambulancias(placa);
CREATE INDEX idx_ambulancias_tipo ON public.ambulancias(tipo);

-- RLS
ALTER TABLE public.ambulancias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar ambulâncias"
    ON public.ambulancias FOR SELECT
    USING (true);

CREATE POLICY "Apenas admins podem inserir ambulâncias"
    ON public.ambulancias FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Apenas admins e operadores podem atualizar ambulâncias"
    ON public.ambulancias FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- =====================================================
-- TABELA: motoristas
-- =====================================================
CREATE TABLE IF NOT EXISTS public.motoristas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    telefone TEXT NOT NULL,
    email TEXT,
    habilitacao TEXT NOT NULL,
    categoria_habilitacao TEXT NOT NULL CHECK (categoria_habilitacao IN ('B', 'C', 'D', 'E')),
    validade_habilitacao DATE NOT NULL,
    data_admissao DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'ferias', 'afastado')),
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_motoristas_status ON public.motoristas(status);
CREATE INDEX idx_motoristas_cpf ON public.motoristas(cpf);
CREATE INDEX idx_motoristas_user_id ON public.motoristas(user_id);

-- RLS
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar motoristas ativos"
    ON public.motoristas FOR SELECT
    USING (status = 'ativo' OR auth.uid() = user_id);

CREATE POLICY "Apenas admins podem gerenciar motoristas"
    ON public.motoristas FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- TABELA: ocorrencias
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ocorrencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_ocorrencia TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL CHECK (tipo IN ('emergencia', 'urgencia', 'transporte', 'transferencia')),
    descricao TEXT NOT NULL,
    solicitante TEXT,
    telefone_solicitante TEXT,

    -- Localização
    endereco TEXT NOT NULL,
    bairro TEXT,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'SP',
    cep TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Atendimento
    ambulancia_id UUID REFERENCES public.ambulancias(id) ON DELETE SET NULL,
    motorista_id UUID REFERENCES public.motoristas(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (
        status IN ('pendente', 'despachada', 'em_andamento', 'finalizada', 'cancelada')
    ),
    prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),

    -- Timestamps
    hora_chamada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hora_despacho TIMESTAMPTZ,
    hora_chegada_local TIMESTAMPTZ,
    hora_saida_local TIMESTAMPTZ,
    hora_chegada_destino TIMESTAMPTZ,
    hora_finalizacao TIMESTAMPTZ,

    -- Dados do paciente
    nome_paciente TEXT,
    idade_paciente INTEGER,
    sexo_paciente TEXT CHECK (sexo_paciente IN ('M', 'F', 'Outro')),

    -- Destino
    hospital_destino TEXT,
    endereco_destino TEXT,

    -- Observações
    observacoes TEXT,
    relatorio_atendimento TEXT,

    -- Auditoria
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ocorrencias_status ON public.ocorrencias(status);
CREATE INDEX idx_ocorrencias_tipo ON public.ocorrencias(tipo);
CREATE INDEX idx_ocorrencias_prioridade ON public.ocorrencias(prioridade);
CREATE INDEX idx_ocorrencias_ambulancia ON public.ocorrencias(ambulancia_id);
CREATE INDEX idx_ocorrencias_motorista ON public.ocorrencias(motorista_id);
CREATE INDEX idx_ocorrencias_numero ON public.ocorrencias(numero_ocorrencia);
CREATE INDEX idx_ocorrencias_data ON public.ocorrencias(hora_chamada DESC);

-- RLS
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar ocorrências"
    ON public.ocorrencias FOR SELECT
    USING (true);

CREATE POLICY "Operadores e admins podem criar ocorrências"
    ON public.ocorrencias FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Operadores e admins podem atualizar ocorrências"
    ON public.ocorrencias FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- =====================================================
-- TABELA: logs_atividades
-- =====================================================
CREATE TABLE IF NOT EXISTS public.logs_atividades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    acao TEXT NOT NULL,
    tabela TEXT NOT NULL,
    registro_id UUID,
    dados_antes JSONB,
    dados_depois JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_logs_user ON public.logs_atividades(user_id);
CREATE INDEX idx_logs_tabela ON public.logs_atividades(tabela);
CREATE INDEX idx_logs_data ON public.logs_atividades(created_at DESC);

-- RLS
ALTER TABLE public.logs_atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins podem visualizar logs"
    ON public.logs_atividades FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- TRIGGERS: updated_at automático
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ambulancias_updated_at BEFORE UPDATE ON public.ambulancias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_motoristas_updated_at BEFORE UPDATE ON public.motoristas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ocorrencias_updated_at BEFORE UPDATE ON public.ocorrencias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Criar profile ao registrar usuário
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'operator');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER: Gerar número de ocorrência automático
-- =====================================================
CREATE OR REPLACE FUNCTION generate_numero_ocorrencia()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_ocorrencia IS NULL THEN
        NEW.numero_ocorrencia := 'OC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                                LPAD(NEXTVAL('ocorrencia_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar sequência para número de ocorrência
CREATE SEQUENCE IF NOT EXISTS ocorrencia_seq;

CREATE TRIGGER set_numero_ocorrencia BEFORE INSERT ON public.ocorrencias
    FOR EACH ROW EXECUTE FUNCTION generate_numero_ocorrencia();

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Ocorrências com detalhes
CREATE OR REPLACE VIEW v_ocorrencias_detalhadas AS
SELECT
    o.*,
    a.placa as ambulancia_placa,
    a.modelo as ambulancia_modelo,
    m.nome as motorista_nome,
    m.telefone as motorista_telefone,
    p.nome as criado_por_nome
FROM public.ocorrencias o
LEFT JOIN public.ambulancias a ON o.ambulancia_id = a.id
LEFT JOIN public.motoristas m ON o.motorista_id = m.id
LEFT JOIN public.profiles p ON o.created_by = p.id;

-- View: Dashboard estatísticas
CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM public.ambulancias WHERE status = 'disponivel') as ambulancias_disponiveis,
    (SELECT COUNT(*) FROM public.ambulancias WHERE status = 'em_uso') as ambulancias_em_uso,
    (SELECT COUNT(*) FROM public.motoristas WHERE status = 'ativo') as motoristas_ativos,
    (SELECT COUNT(*) FROM public.ocorrencias WHERE status = 'pendente') as ocorrencias_pendentes,
    (SELECT COUNT(*) FROM public.ocorrencias WHERE status = 'em_andamento') as ocorrencias_em_andamento,
    (SELECT COUNT(*) FROM public.ocorrencias WHERE DATE(hora_chamada) = CURRENT_DATE) as ocorrencias_hoje;

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL - APENAS PARA DESENVOLVIMENTO)
-- =====================================================
-- Descomente as linhas abaixo para inserir dados de exemplo

-- INSERT INTO public.ambulancias (placa, modelo, ano, tipo, status) VALUES
-- ('ABC-1234', 'Mercedes-Benz Sprinter', 2022, 'uti_movel', 'disponivel'),
-- ('DEF-5678', 'Fiat Ducato', 2021, 'basica', 'disponivel'),
-- ('GHI-9012', 'Renault Master', 2023, 'suporte_avancado', 'disponivel');

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
