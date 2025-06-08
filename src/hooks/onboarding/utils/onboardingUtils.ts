
import { UserProfile } from '@/lib/supabase';

// Lista de emails que devem fazer onboarding obrigatório
const ONBOARDING_REQUIRED_EMAILS = [
  'club-teste@viverdeia.ai',
  'membro-teste@viverdeia.ai',
  'formacao-teste@viverdeia.ai'
];

// Lista de emails que devem pular onboarding
const ONBOARDING_BYPASS_EMAILS = [
  'admin@teste.com',
  'user@teste.com',
  'admin@viverdeia.ai',
  'rafael@viverdeia.ai'
];

/**
 * Determina a ação do onboarding baseada no email e perfil do usuário
 */
export const getOnboardingAction = (
  email?: string, 
  profile?: UserProfile | null
): 'bypass' | 'required' | 'suggested' | 'optional' | null => {
  if (!email || !profile) return null;

  // Verificar se deve pular onboarding
  if (ONBOARDING_BYPASS_EMAILS.includes(email)) {
    return 'bypass';
  }

  // Verificar se onboarding é obrigatório
  if (ONBOARDING_REQUIRED_EMAILS.includes(email)) {
    return 'required';
  }

  // Verificar se já completou onboarding
  if (profile.onboarding_completed_at) {
    return 'bypass';
  }

  // Para membros club que não completaram onboarding
  if (profile.role === 'membro_club' || profile.role === 'member') {
    return 'required';
  }

  // Para outros casos, sugerir onboarding
  return 'suggested';
};

/**
 * Verifica se há onboarding pendente
 */
export const hasOnboardingPending = (profile?: UserProfile | null): boolean => {
  if (!profile) return false;
  
  // Se já completou, não está pendente
  if (profile.onboarding_completed_at) return false;
  
  // Se é membro club e não completou, está pendente
  return profile.role === 'membro_club' || profile.role === 'member';
};

/**
 * Calcula estatísticas do onboarding
 */
export const getOnboardingStats = (profile?: UserProfile | null) => {
  if (!profile) return null;

  const now = new Date();
  const createdAt = new Date(profile.created_at);
  const accountAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  return {
    accountAgeDays,
    isNewUser: accountAgeDays < 7,
    hasCompleted: !!profile.onboarding_completed_at,
    hasSkipped: false // Placeholder, pode ser expandido futuramente
  };
};

/**
 * Log da decisão de onboarding para debug
 */
export const logOnboardingDecision = (
  email?: string,
  profile?: UserProfile | null,
  action?: string | null
) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 Decisão de Onboarding:', {
      email,
      role: profile?.role,
      action,
      completedAt: profile?.onboarding_completed_at,
      createdAt: profile?.created_at
    });
  }
};
