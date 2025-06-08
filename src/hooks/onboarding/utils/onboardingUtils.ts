
import { UserProfile } from '@/lib/supabase';

/**
 * Utilitários para sistema de onboarding - FASE 4
 * Sistema inteligente de decisão com critérios refinados
 */

// Lista de usuários com bypass total (super admins)
const BYPASS_USERS = [
  'rafael@viverdeia.ai'
];

/**
 * Verifica se o usuário deve fazer bypass total do onboarding
 * FASE 4: Critérios mais específicos
 */
export const shouldBypassOnboarding = (
  email: string | null | undefined,
  profile: UserProfile | null
): boolean => {
  // Bypass para super admins
  if (email && BYPASS_USERS.includes(email)) {
    console.log('🚀 Bypass total para super admin:', email);
    return true;
  }

  // Bypass para admins da plataforma
  if (profile?.role === 'admin') {
    console.log('🔑 Bypass total para admin:', email);
    return true;
  }

  // Bypass para usuários formacao (eles têm área própria)
  if (profile?.role === 'formacao') {
    console.log('📚 Bypass para usuário formacao:', email);
    return true;
  }

  // Bypass se já completou onboarding
  if (profile?.onboarding_completed_at) {
    console.log('✅ Bypass - onboarding já concluído:', email);
    return true;
  }

  // Bypass se pulou onboarding (respeitando escolha do usuário)
  if (profile?.onboarding_skipped_at) {
    console.log('⏭️ Bypass - usuário pulou onboarding:', email);
    return true;
  }

  return false;
};

/**
 * Verifica se o usuário é considerado "novo" e DEVE ver o onboarding
 * FASE 4: Critérios mais refinados para novos usuários
 */
export const shouldShowOnboarding = (
  profile: UserProfile | null
): boolean => {
  if (!profile) return false;

  // Apenas para membros (role 'membro_club' ou 'member')
  if (profile.role !== 'membro_club' && profile.role !== 'member') {
    return false;
  }

  // Se já completou ou pulou, não mostrar
  if (profile.onboarding_completed_at || profile.onboarding_skipped_at) {
    return false;
  }

  // Critério: usuário criado nos últimos 7 dias
  const accountAge = new Date().getTime() - new Date(profile.created_at).getTime();
  const daysSinceCreation = Math.floor(accountAge / (24 * 60 * 60 * 1000));
  
  if (daysSinceCreation <= 7) {
    console.log(`📋 Novo usuário (${daysSinceCreation} dias) - mostrar onboarding:`, profile.email);
    return true;
  }

  console.log(`👤 Usuário existente (${daysSinceCreation} dias) - onboarding opcional:`, profile.email);
  return false;
};

/**
 * Verifica se deve sugerir onboarding (usuário pode escolher)
 * FASE 4: Para usuários que podem se beneficiar mas não são obrigatórios
 */
export const shouldSuggestOnboarding = (
  profile: UserProfile | null
): boolean => {
  if (!profile || (profile.role !== 'membro_club' && profile.role !== 'member')) return false;
  
  // Se já completou ou pulou, não sugerir
  if (profile.onboarding_completed_at || profile.onboarding_skipped_at) {
    return false;
  }

  // Sugerir para usuários entre 7-30 dias
  const accountAge = new Date().getTime() - new Date(profile.created_at).getTime();
  const daysSinceCreation = Math.floor(accountAge / (24 * 60 * 60 * 1000));
  
  return daysSinceCreation > 7 && daysSinceCreation <= 30;
};

/**
 * Determina a ação do onboarding baseada no perfil do usuário
 * FASE 4: Sistema refinado de decisão
 */
export const getOnboardingAction = (
  email: string | null | undefined,
  profile: UserProfile | null
): 'bypass' | 'required' | 'suggested' | 'optional' => {
  if (shouldBypassOnboarding(email, profile)) {
    return 'bypass';
  }

  if (shouldShowOnboarding(profile)) {
    return 'required';
  }

  if (shouldSuggestOnboarding(profile)) {
    return 'suggested';
  }

  return 'optional';
};

/**
 * Log de diagnóstico para debug - FASE 4
 */
export const logOnboardingDecision = (
  email: string | null | undefined,
  profile: UserProfile | null,
  action: string
) => {
  const accountAge = profile ? 
    Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (24 * 60 * 60 * 1000)) : 
    null;

  console.log('🎯 Decisão de Onboarding FASE 4:', {
    email,
    role: profile?.role,
    createdAt: profile?.created_at,
    accountAgeDays: accountAge,
    hasCompletedOnboarding: !!profile?.onboarding_completed_at,
    hasSkippedOnboarding: !!profile?.onboarding_skipped_at,
    action,
    timestamp: new Date().toISOString()
  });
};

/**
 * Verifica se o usuário tem onboarding pendente
 * FASE 4: Para uso em dashboards e sugestões
 */
export const hasOnboardingPending = (profile: UserProfile | null): boolean => {
  if (!profile || (profile.role !== 'membro_club' && profile.role !== 'member')) return false;
  return !profile.onboarding_completed_at && !profile.onboarding_skipped_at;
};

/**
 * Calcula estatísticas do onboarding para analytics
 * FASE 4: Para admin e métricas
 */
export const getOnboardingStats = (profile: UserProfile | null) => {
  if (!profile) return null;

  const accountAge = Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (24 * 60 * 60 * 1000));
  
  return {
    accountAgeDays: accountAge,
    isNewUser: accountAge <= 7,
    hasCompleted: !!profile.onboarding_completed_at,
    hasSkipped: !!profile.onboarding_skipped_at,
    isPending: hasOnboardingPending(profile),
    shouldSuggest: shouldSuggestOnboarding(profile)
  };
};
