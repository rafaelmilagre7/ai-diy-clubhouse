
import { UserProfile } from '@/lib/supabase';

/**
 * Utilitários para sistema de bypass do onboarding
 * FASE 2: Implementação segura que protege usuários existentes
 */

// Lista de usuários com bypass total (super admins)
const BYPASS_USERS = [
  'rafael@viverdeia.ai'
];

/**
 * Verifica se o usuário deve fazer bypass total do onboarding
 * Admin e usuários específicos sempre fazem bypass
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

  // Por enquanto, vamos fazer bypass para todos os usuários existentes
  // Isso garante que ninguém seja afetado na Fase 2
  if (profile && profile.created_at) {
    console.log('👤 Bypass para usuário existente:', email);
    return true;
  }

  return false;
};

/**
 * Verifica se o usuário é considerado "novo" e precisa do onboarding
 * Critérios: usuário recém-criado sem atividade significativa
 */
export const shouldShowOnboarding = (
  profile: UserProfile | null
): boolean => {
  if (!profile) return false;

  // Por enquanto, retornamos false para manter segurança total
  // Futuramente aqui vamos implementar critérios mais específicos
  console.log('📋 Verificando necessidade de onboarding para:', profile.email);
  
  return false; // FASE 2: Manter conservador
};

/**
 * Determina a ação do onboarding baseada no perfil do usuário
 */
export const getOnboardingAction = (
  email: string | null | undefined,
  profile: UserProfile | null
): 'bypass' | 'show' | 'optional' => {
  if (shouldBypassOnboarding(email, profile)) {
    return 'bypass';
  }

  if (shouldShowOnboarding(profile)) {
    return 'show';
  }

  return 'optional'; // Usuário pode acessar manualmente se quiser
};

/**
 * Log de diagnóstico para debug
 */
export const logOnboardingDecision = (
  email: string | null | undefined,
  profile: UserProfile | null,
  action: string
) => {
  console.log('🎯 Decisão de Onboarding:', {
    email,
    role: profile?.role,
    createdAt: profile?.created_at,
    action,
    timestamp: new Date().toISOString()
  });
};
