/**
 * Tipos globais do Sistema de Gestão de Ambulâncias
 *
 * Este arquivo centraliza as definições de tipos TypeScript
 * baseadas no schema do Supabase.
 */

// ============================================
// ENUMS
// ============================================

export enum TipoPerfil {
  MEDICO = 'MEDICO',
  ENFERMEIRO = 'ENFERMEIRO',
  MOTORISTA = 'MOTORISTA',
  CHEFE_MEDICOS = 'CHEFE_MEDICOS',
  CHEFE_ENFERMEIROS = 'CHEFE_ENFERMEIROS',
  CHEFE_AMBULANCIAS = 'CHEFE_AMBULANCIAS'
}

export enum StatusOcorrencia {
  EM_ABERTO = 'EM_ABERTO',
  CONFIRMADA = 'CONFIRMADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA'
}

export enum TipoAmbulancia {
  BASICA = 'BASICA',
  EMERGENCIA = 'EMERGENCIA'
}

export enum TipoTrabalho {
  EVENTO = 'EVENTO',
  DOMICILIAR = 'DOMICILIAR',
  EMERGENCIA = 'EMERGENCIA',
  TRANSFERENCIA = 'TRANSFERENCIA'
}

export enum StatusAmbulancia {
  PRONTA = 'PRONTA',
  PENDENTE = 'PENDENTE',
  REVISAO = 'REVISAO',
  EM_OPERACAO = 'EM_OPERACAO'
}

export enum CategoriaEquipamento {
  VIAS_AEREAS_AMBU = 'VIAS_AEREAS_AMBU',
  EPI_INDIVIDUAL = 'EPI_INDIVIDUAL',
  PROCEDIMENTO_PUNCAO = 'PROCEDIMENTO_PUNCAO',
  MATERIAIS_ELETRICOS = 'MATERIAIS_ELETRICOS',
  MATERIAL_AMB_GERAL = 'MATERIAL_AMB_GERAL',
  SUTURA_BOLSA = 'SUTURA_BOLSA',
  SONDAGEM_BOLSA = 'SONDAGEM_BOLSA'
}

export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
  OUTRO = 'OUTRO'
}

// ============================================
// TIPOS DE TABELAS
// ============================================

export interface Usuario {
  id: number;
  nome_completo: string;
  cpf: string;
  email: string;
  telefone?: string;
  senha_hash: string;
  tipo_perfil: TipoPerfil;
  idade?: number;
  sexo?: Sexo;
  endereco_completo?: string;
  data_admissao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Motorista {
  id: number;
  usuario_id: number;
  cnh: string;
  validade_cnh: string;
  categoria_cnh: string;
  created_at: string;
  updated_at: string;
}

export interface Escala {
  id: number;
  usuario_id: number;
  data: string;
  disponivel: boolean;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Ambulancia {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  motor?: string;
  kilometragem: number;
  ultima_revisao?: string;
  proxima_revisao?: string;
  kilometragem_proxima_revisao?: number;
  status_ambulancia: StatusAmbulancia;
  tipo_atual?: TipoAmbulancia;
  tablet_id?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipamentoCatalogo {
  id: number;
  nome: string;
  categoria: CategoriaEquipamento;
  tipo_ambulancia: TipoAmbulancia;
  unidade_medida: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export interface EstoqueAmbulancia {
  id: number;
  ambulancia_id: number;
  equipamento_id: number;
  quantidade_atual: number;
  quantidade_minima: number;
  ultima_verificacao?: string;
  updated_at: string;
}

export interface GastoAmbulancia {
  id: number;
  ambulancia_id: number;
  tipo_gasto: string;
  valor: number;
  descricao?: string;
  data_gasto: string;
  registrado_por?: number;
  created_at: string;
}

export interface ChecklistTecnicoAmbulancia {
  id: number;
  ambulancia_id: number;
  verificado_por: number;
  data_verificacao: string;
  gasolina_ok: boolean;
  kilometragem_registrada?: number;
  temperatura_ok: boolean;
  pressao_pneus_ok: boolean;
  revisao_ok: boolean;
  observacoes?: string;
  aprovado: boolean;
}

export interface ChecklistEquipamentosAmbulancia {
  id: number;
  ambulancia_id: number;
  verificado_por: number;
  data_verificacao: string;
  tipo_definido: TipoAmbulancia;
  observacoes?: string;
  aprovado: boolean;
}

export interface ChecklistEquipamentosItem {
  id: number;
  checklist_id: number;
  equipamento_id: number;
  quantidade_verificada: number;
  quantidade_reposta: number;
  conforme: boolean;
  observacoes?: string;
}

export interface Ocorrencia {
  id: number;
  numero_ocorrencia: string;
  tipo_ambulancia: TipoAmbulancia;
  tipo_trabalho: TipoTrabalho;
  status_ocorrencia: StatusOcorrencia;
  descricao?: string;
  local_ocorrencia: string;
  endereco_completo?: string;
  latitude?: number;
  longitude?: number;
  data_ocorrencia: string;
  horario_saida: string;
  horario_chegada_local?: string;
  horario_termino?: string;
  carga_horaria?: number;
  criado_por: number;
  ambulancia_id?: number;
  motorista_id?: number;
  data_atribuicao?: string;
  data_inicio?: string;
  data_conclusao?: string;
  duracao_total?: number;
  created_at: string;
  updated_at: string;
}

export interface OcorrenciaParticipante {
  id: number;
  ocorrencia_id: number;
  usuario_id: number | null;
  usuario_designado_id?: number | null; // ID do profissional designado diretamente pelo chefe
  funcao: TipoPerfil;
  valor_pagamento?: number;
  data_pagamento?: string;
  pago: boolean;
  confirmado: boolean;
  data_confirmacao?: string;
  created_at: string;
}

export interface Paciente {
  id: number;
  nome_completo: string;
  cpf?: string;
  data_nascimento?: string;
  idade?: number;
  sexo?: Sexo;
  telefone?: string;
  endereco_completo?: string;
  contato_emergencia?: string;
  telefone_emergencia?: string;
  observacoes_gerais?: string;
  created_at: string;
  updated_at: string;
}

export interface Atendimento {
  id: number;
  ocorrencia_id: number;
  paciente_id: number;
  medico_id?: number;
  data_atendimento: string;
  queixa_principal?: string;
  quadro_clinico?: string;
  procedimentos_realizados?: string;
  diagnostico?: string;
  remocao: boolean;
  hospital_destino?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface AtendimentoArquivo {
  id: number;
  atendimento_id: number;
  tipo_arquivo: string;
  nome_arquivo: string;
  caminho_arquivo: string;
  tamanho_bytes?: number;
  uploaded_at: string;
}

export interface NotaEnfermeiroPaciente {
  id: number;
  atendimento_id: number;
  enfermeiro_id: number;
  nota: string;
  created_at: string;
}

export interface ConsumoMaterial {
  id: number;
  ocorrencia_id: number;
  ambulancia_id: number;
  equipamento_id: number;
  quantidade_utilizada: number;
  registrado_por: number;
  data_registro: string;
}

export interface Notificacao {
  id: number;
  remetente_id?: number;
  destinatario_id?: number;
  ocorrencia_id?: number;
  tipo_notificacao: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_leitura?: string;
  created_at: string;
}

export interface RastreamentoAmbulancia {
  id: number;
  ambulancia_id: number;
  ocorrencia_id?: number;
  latitude: number;
  longitude: number;
  velocidade?: number;
  timestamp: string;
}

export interface LogSistema {
  id: number;
  usuario_id?: number;
  acao: string;
  tabela_afetada?: string;
  registro_id?: number;
  descricao?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================
// TIPOS DE VIEWS
// ============================================

export interface ResumoOcorrencia {
  mes: string;
  tipo_trabalho: TipoTrabalho;
  tipo_ambulancia: TipoAmbulancia;
  status_ocorrencia: StatusOcorrencia;
  total_ocorrencias: number;
  duracao_media_minutos?: number;
}

export interface EstatisticaAmbulancia {
  id: number;
  placa: string;
  modelo: string;
  status_ambulancia: StatusAmbulancia;
  total_ocorrencias: number;
  total_emergencias: number;
  total_eventos: number;
  total_domiciliar: number;
  total_transferencias: number;
  total_gastos: number;
}

export interface ProfissionalDisponivel {
  data: string;
  usuario_id: number;
  nome_completo: string;
  tipo_perfil: TipoPerfil;
  disponivel: boolean;
  livre_para_ocorrencias: boolean;
}

export interface EstoqueBaixo {
  placa: string;
  equipamento: string;
  categoria: CategoriaEquipamento;
  quantidade_atual: number;
  quantidade_minima: number;
  quantidade_a_repor: number;
}

export interface PagamentoPendente {
  numero_ocorrencia: string;
  data_ocorrencia: string;
  tipo_trabalho: TipoTrabalho;
  profissional: string;
  tipo_perfil: TipoPerfil;
  valor_pagamento?: number;
  data_pagamento?: string;
}

// ============================================
// TIPOS UTILITÁRIOS
// ============================================

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

// Tipos com relações expandidas
export interface UsuarioComMotorista extends Usuario {
  motorista?: Motorista;
}

export interface OcorrenciaCompleta extends Ocorrencia {
  ambulancia?: Ambulancia;
  motorista?: Usuario;
  criador?: Usuario;
  participantes?: OcorrenciaParticipante[];
  atendimentos?: Atendimento[];
}

export interface AtendimentoCompleto extends Atendimento {
  paciente: Paciente;
  medico?: Usuario;
  notas_enfermeiro?: NotaEnfermeiroPaciente[];
  arquivos?: AtendimentoArquivo[];
}

// Tipos para formulários
export interface UsuarioFormData extends Omit<Usuario, 'id' | 'created_at' | 'updated_at' | 'senha_hash'> {
  senha?: string;
}

// Tipo para definir uma vaga de profissional ao criar ocorrência
export enum TipoVaga {
  ABERTA_MEDICO = 'ABERTA_MEDICO', // Qualquer médico pode se candidatar
  ABERTA_ENFERMEIRO = 'ABERTA_ENFERMEIRO', // Qualquer enfermeiro pode se candidatar
  DESIGNADA = 'DESIGNADA', // Profissional específico já escolhido
}

export interface VagaProfissional {
  tipo: TipoVaga;
  funcao: TipoPerfil; // MEDICO ou ENFERMEIRO
  usuarioDesignado?: {
    id: number;
    nome_completo: string;
  } | null;
}

export interface OcorrenciaFormData extends Omit<Ocorrencia, 'id' | 'created_at' | 'updated_at' | 'numero_ocorrencia'> {
  vagas?: VagaProfissional[]; // Lista dinâmica de profissionais
}

export interface AmbulanciaFormData extends Omit<Ambulancia, 'id' | 'created_at' | 'updated_at'> {}

// Tipos para database completo
export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario;
        Insert: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Usuario, 'id' | 'created_at'>>;
      };
      motoristas: {
        Row: Motorista;
        Insert: Omit<Motorista, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Motorista, 'id' | 'created_at'>>;
      };
      escala: {
        Row: Escala;
        Insert: Omit<Escala, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Escala, 'id' | 'created_at'>>;
      };
      ambulancias: {
        Row: Ambulancia;
        Insert: Omit<Ambulancia, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Ambulancia, 'id' | 'created_at'>>;
      };
      equipamentos_catalogo: {
        Row: EquipamentoCatalogo;
        Insert: Omit<EquipamentoCatalogo, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EquipamentoCatalogo, 'id' | 'created_at'>>;
      };
      estoque_ambulancias: {
        Row: EstoqueAmbulancia;
        Insert: Omit<EstoqueAmbulancia, 'id' | 'updated_at'>;
        Update: Partial<Omit<EstoqueAmbulancia, 'id'>>;
      };
      gastos_ambulancias: {
        Row: GastoAmbulancia;
        Insert: Omit<GastoAmbulancia, 'id' | 'created_at'>;
        Update: Partial<Omit<GastoAmbulancia, 'id' | 'created_at'>>;
      };
      checklist_tecnico_ambulancias: {
        Row: ChecklistTecnicoAmbulancia;
        Insert: Omit<ChecklistTecnicoAmbulancia, 'id'>;
        Update: Partial<Omit<ChecklistTecnicoAmbulancia, 'id'>>;
      };
      checklist_equipamentos_ambulancias: {
        Row: ChecklistEquipamentosAmbulancia;
        Insert: Omit<ChecklistEquipamentosAmbulancia, 'id'>;
        Update: Partial<Omit<ChecklistEquipamentosAmbulancia, 'id'>>;
      };
      checklist_equipamentos_itens: {
        Row: ChecklistEquipamentosItem;
        Insert: Omit<ChecklistEquipamentosItem, 'id'>;
        Update: Partial<Omit<ChecklistEquipamentosItem, 'id'>>;
      };
      ocorrencias: {
        Row: Ocorrencia;
        Insert: Omit<Ocorrencia, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Ocorrencia, 'id' | 'created_at'>>;
      };
      ocorrencias_participantes: {
        Row: OcorrenciaParticipante;
        Insert: Omit<OcorrenciaParticipante, 'id' | 'created_at'>;
        Update: Partial<Omit<OcorrenciaParticipante, 'id' | 'created_at'>>;
      };
      pacientes: {
        Row: Paciente;
        Insert: Omit<Paciente, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Paciente, 'id' | 'created_at'>>;
      };
      atendimentos: {
        Row: Atendimento;
        Insert: Omit<Atendimento, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Atendimento, 'id' | 'created_at'>>;
      };
      atendimentos_arquivos: {
        Row: AtendimentoArquivo;
        Insert: Omit<AtendimentoArquivo, 'id' | 'uploaded_at'>;
        Update: Partial<Omit<AtendimentoArquivo, 'id' | 'uploaded_at'>>;
      };
      notas_enfermeiro_pacientes: {
        Row: NotaEnfermeiroPaciente;
        Insert: Omit<NotaEnfermeiroPaciente, 'id' | 'created_at'>;
        Update: Partial<Omit<NotaEnfermeiroPaciente, 'id' | 'created_at'>>;
      };
      consumo_materiais: {
        Row: ConsumoMaterial;
        Insert: Omit<ConsumoMaterial, 'id' | 'data_registro'>;
        Update: Partial<Omit<ConsumoMaterial, 'id' | 'data_registro'>>;
      };
      notificacoes: {
        Row: Notificacao;
        Insert: Omit<Notificacao, 'id' | 'created_at'>;
        Update: Partial<Omit<Notificacao, 'id' | 'created_at'>>;
      };
      rastreamento_ambulancias: {
        Row: RastreamentoAmbulancia;
        Insert: Omit<RastreamentoAmbulancia, 'id' | 'timestamp'>;
        Update: Partial<Omit<RastreamentoAmbulancia, 'id' | 'timestamp'>>;
      };
      logs_sistema: {
        Row: LogSistema;
        Insert: Omit<LogSistema, 'id' | 'created_at'>;
        Update: Partial<Omit<LogSistema, 'id' | 'created_at'>>;
      };
    };
    Views: {
      vw_resumo_ocorrencias: {
        Row: ResumoOcorrencia;
      };
      vw_estatisticas_ambulancias: {
        Row: EstatisticaAmbulancia;
      };
      vw_profissionais_disponiveis: {
        Row: ProfissionalDisponivel;
      };
      vw_estoque_baixo: {
        Row: EstoqueBaixo;
      };
      vw_pagamentos_pendentes: {
        Row: PagamentoPendente;
      };
    };
  };
};
