/**
 * Tipos globais do Sistema de Gestão de Ambulâncias
 *
 * Este arquivo centraliza as definições de tipos TypeScript
 * usadas em todo o projeto.
 */

// Tipos de database - serão expandidos conforme o schema do Supabase
export type Database = {
  public: {
    Tables: {
      // As tabelas serão definidas aqui conforme o schema
    };
  };
};

// Tipos de autenticação
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'driver';
  created_at: string;
}

// Tipos de ambulância
export interface Ambulancia {
  id: string;
  placa: string;
  modelo: string;
  ano: number;
  status: 'disponivel' | 'em_uso' | 'manutencao';
  created_at: string;
  updated_at: string;
}

// Tipos de motorista
export interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  habilitacao: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

// Tipos de ocorrência
export interface Ocorrencia {
  id: string;
  tipo: string;
  descricao: string;
  localizacao: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  ambulancia_id?: string;
  motorista_id?: string;
  created_at: string;
  updated_at: string;
}

// Tipos utilitários
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};
