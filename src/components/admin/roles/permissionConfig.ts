import { 
  GraduationCap, 
  Rocket, 
  Users, 
  Gift, 
  Lightbulb, 
  Shield,
  Calendar,
  Network
} from 'lucide-react';

/**
 * Configuração completa de todas as permissões disponíveis
 * Sincronizada com src/config/features.ts
 */

export interface PermissionDefinition {
  key: string;
  label: string;
  description?: string;
  warning?: string;
}

export interface PermissionCategoryConfig {
  title: string;
  icon: typeof GraduationCap;
  permissions: PermissionDefinition[];
}

/**
 * Permissões padrão quando um novo role é criado
 */
export const defaultPermissions = {
  // 🎓 Aprendizado
  learning: false,
  formacao: false,
  lovable_course: false,
  
  // 🚀 Recursos Principais
  solutions: false,
  tools: false,
  builder: false,
  builder_limit: 3,
  
  // 🤝 Comunidade & Networking
  community: false,
  networking: false,
  events: false,
  
  // 🎁 Benefícios
  benefits: false,
  certificates: false,
  
  // 💡 Outros
  suggestions: false,
  ai_trail: false,
  implementation_trail: false,
  
  // 🛡️ Administrativo
  admin: false
};

/**
 * Configuração de categorias e permissões organizadas
 */
export const permissionCategories: PermissionCategoryConfig[] = [
  {
    title: '🎓 Aprendizado',
    icon: GraduationCap,
    permissions: [
      {
        key: 'learning',
        label: 'Formações e Cursos',
        description: 'Acesso a todos os cursos e formações disponíveis na plataforma'
      },
      {
        key: 'formacao',
        label: 'Formação Específica',
        description: 'Acesso a formações específicas e conteúdos premium'
      },
      {
        key: 'lovable_course',
        label: 'Curso Lovable',
        description: 'Acesso ao curso específico do Lovable'
      }
    ]
  },
  {
    title: '🚀 Recursos Principais',
    icon: Rocket,
    permissions: [
      {
        key: 'solutions',
        label: 'Soluções de Negócio',
        description: 'Acesso às soluções e arquiteturas de negócio'
      },
      {
        key: 'tools',
        label: 'Ferramentas',
        description: 'Acesso às ferramentas e integrações da plataforma'
      },
      {
        key: 'builder',
        label: 'Builder de Soluções',
        description: 'Gerador de arquitetura de soluções com IA'
      }
    ]
  },
  {
    title: '🤝 Comunidade & Networking',
    icon: Users,
    permissions: [
      {
        key: 'community',
        label: 'Comunidade',
        description: 'Acesso aos recursos da comunidade e fóruns'
      },
      {
        key: 'networking',
        label: 'Networking Inteligente',
        description: 'Sistema de conexões e networking entre membros',
        warning: 'Usuários poderão se conectar e trocar informações com outros membros'
      },
      {
        key: 'events',
        label: 'Mentorias e Eventos',
        description: 'Acesso ao calendário de mentorias e eventos ao vivo',
        warning: 'Usuários poderão visualizar e participar de mentorias agendadas'
      }
    ]
  },
  {
    title: '🎁 Benefícios',
    icon: Gift,
    permissions: [
      {
        key: 'benefits',
        label: 'Benefícios Exclusivos',
        description: 'Acesso a benefícios e vantagens exclusivas para membros'
      },
      {
        key: 'certificates',
        label: 'Certificados',
        description: 'Emissão de certificados de conclusão de cursos'
      }
    ]
  },
  {
    title: '💡 Recursos Avançados',
    icon: Lightbulb,
    permissions: [
      {
        key: 'suggestions',
        label: 'Central de Sugestões',
        description: 'Envio de sugestões e feedback para a plataforma'
      },
      {
        key: 'ai_trail',
        label: 'Trilha de IA',
        description: 'Trilha personalizada de implementação com IA'
      },
      {
        key: 'implementation_trail',
        label: 'Trilha de Implementação',
        description: 'Recomendações baseadas no onboarding completo'
      }
    ]
  },
  {
    title: '🛡️ Administrativo',
    icon: Shield,
    permissions: [
      {
        key: 'admin',
        label: 'Acesso Administrativo',
        description: 'Acesso total ao painel administrativo',
        warning: '⚠️ ATENÇÃO: Usuários com esta permissão terão acesso total à plataforma, incluindo gestão de usuários, configurações e dados sensíveis.'
      }
    ]
  }
];

/**
 * Labels amigáveis para as permissões
 * Usado para exibição em tabelas e listas
 */
export const permissionLabels: Record<string, string> = {
  learning: 'Formações e Cursos',
  formacao: 'Formação Específica',
  lovable_course: 'Curso Lovable',
  solutions: 'Soluções de Negócio',
  tools: 'Ferramentas',
  builder: 'Builder de Soluções',
  builder_limit: 'Limite do Builder',
  community: 'Comunidade',
  networking: 'Networking Inteligente',
  events: 'Mentorias e Eventos',
  benefits: 'Benefícios Exclusivos',
  certificates: 'Certificados',
  suggestions: 'Central de Sugestões',
  ai_trail: 'Trilha de IA',
  implementation_trail: 'Trilha de Implementação',
  admin: 'Acesso Administrativo'
};

/**
 * Obter label amigável de uma permissão
 */
export const getPermissionLabel = (key: string): string => {
  return permissionLabels[key] || key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};
