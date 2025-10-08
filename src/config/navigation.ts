import { TipoPerfil } from '@/types';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Truck,
  MapPin,
  UserCog,
  CalendarDays,
  Activity,
  Package,
} from 'lucide-react';

/**
 * Configuração de Navegação por Perfil
 *
 * Define os itens de menu disponíveis para cada perfil de usuário
 */

export interface NavigationItem {
  label: string;
  href: string;
  icon: any; // Lucide icon component
  perfis: TipoPerfil[];
  description?: string;
}

/**
 * Itens de navegação do sistema
 */
export const navigationItems: NavigationItem[] = [
  // MÉDICO
  {
    label: 'Dashboard',
    href: '/medico',
    icon: LayoutDashboard,
    perfis: ['MEDICO'],
    description: 'Visão geral e estatísticas',
  },
  {
    label: 'Agenda',
    href: '/medico/agenda',
    icon: Calendar,
    perfis: ['MEDICO'],
    description: 'Suas ocorrências agendadas',
  },
  {
    label: 'Pacientes',
    href: '/medico/pacientes',
    icon: Users,
    perfis: ['MEDICO'],
    description: 'Banco de dados de pacientes',
  },

  // ENFERMEIRO
  {
    label: 'Dashboard',
    href: '/enfermeiro',
    icon: LayoutDashboard,
    perfis: ['ENFERMEIRO'],
    description: 'Visão geral e estatísticas',
  },
  {
    label: 'Agenda',
    href: '/enfermeiro/agenda',
    icon: Calendar,
    perfis: ['ENFERMEIRO'],
    description: 'Suas ocorrências agendadas',
  },
  {
    label: 'Pacientes',
    href: '/enfermeiro/pacientes',
    icon: Users,
    perfis: ['ENFERMEIRO'],
    description: 'Banco de dados de pacientes',
  },

  // MOTORISTA (Tablet)
  {
    label: 'Ocorrência Ativa',
    href: '/motorista',
    icon: Activity,
    perfis: ['MOTORISTA'],
    description: 'Sua ocorrência atual',
  },

  // CHEFE DOS MÉDICOS
  {
    label: 'Dashboard',
    href: '/chefe-medicos',
    icon: LayoutDashboard,
    perfis: ['CHEFE_MEDICOS'],
    description: 'Visão geral do sistema',
  },
  {
    label: 'Central de Despacho',
    href: '/chefe-medicos/central-despacho',
    icon: FileText,
    perfis: ['CHEFE_MEDICOS'],
    description: 'Criar novas ocorrências',
  },
  {
    label: 'Ocorrências',
    href: '/chefe-medicos/ocorrencias',
    icon: FileText,
    perfis: ['CHEFE_MEDICOS'],
    description: 'Banco de dados de ocorrências',
  },
  {
    label: 'Rastreamento',
    href: '/chefe-medicos/rastreamento',
    icon: MapPin,
    perfis: ['CHEFE_MEDICOS'],
    description: 'Rastreamento de ambulâncias',
  },
  {
    label: 'Ambulâncias',
    href: '/chefe-medicos/ambulancias',
    icon: Truck,
    perfis: ['CHEFE_MEDICOS'],
    description: 'Gestão de ambulâncias',
  },
  {
    label: 'Profissionais',
    href: '/chefe-medicos/profissionais',
    icon: UserCog,
    perfis: ['CHEFE_MEDICOS'],
    description: 'Gestão de profissionais',
  },
  {
    label: 'Pacientes',
    href: '/chefe-medicos/pacientes',
    icon: Users,
    perfis: ['CHEFE_MEDICOS'],
    description: 'Banco de dados de pacientes',
  },
  {
    label: 'Escala',
    href: '/chefe-medicos/escala',
    icon: CalendarDays,
    perfis: ['CHEFE_MEDICOS'],
    description: 'Gestão de escala',
  },

  // CHEFE DAS AMBULÂNCIAS
  {
    label: 'Dashboard',
    href: '/chefe-ambulancias',
    icon: LayoutDashboard,
    perfis: ['CHEFE_AMBULANCIAS'],
    description: 'Visão geral da frota',
  },
  {
    label: 'Status Ambulâncias',
    href: '/chefe-ambulancias/status',
    icon: Truck,
    perfis: ['CHEFE_AMBULANCIAS'],
    description: 'Status e checklist técnico',
  },
  {
    label: 'Atribuição de Ocorrências',
    href: '/chefe-ambulancias/atribuicao',
    icon: FileText,
    perfis: ['CHEFE_AMBULANCIAS'],
    description: 'Atribuir ambulâncias e motoristas',
  },

  // CHEFE DOS ENFERMEIROS
  {
    label: 'Dashboard',
    href: '/chefe-enfermeiros',
    icon: LayoutDashboard,
    perfis: ['CHEFE_ENFERMEIROS'],
    description: 'Visão geral de equipamentos',
  },
  {
    label: 'Status de Equipamentos',
    href: '/chefe-enfermeiros/equipamentos',
    icon: Package,
    perfis: ['CHEFE_ENFERMEIROS'],
    description: 'Checklist de equipamentos médicos',
  },
];

/**
 * Retorna os itens de navegação para um perfil específico
 */
export function getNavigationForProfile(perfil: TipoPerfil): NavigationItem[] {
  return navigationItems.filter((item) => item.perfis.includes(perfil));
}

/**
 * Retorna o label do perfil formatado
 */
export function getProfileLabel(perfil: TipoPerfil): string {
  const labels: Record<TipoPerfil, string> = {
    MEDICO: 'Médico',
    ENFERMEIRO: 'Enfermeiro',
    MOTORISTA: 'Motorista',
    CHEFE_MEDICOS: 'Chefe dos Médicos',
    CHEFE_ENFERMEIROS: 'Chefe dos Enfermeiros',
    CHEFE_AMBULANCIAS: 'Chefe das Ambulâncias',
  };
  return labels[perfil] || perfil;
}
