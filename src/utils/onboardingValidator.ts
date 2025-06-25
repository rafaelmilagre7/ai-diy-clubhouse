
import { UserProfile } from '@/lib/supabase/types';
import { logger } from '@/utils/logger';

/**
 * Utilitário centralizado para validação de onboarding
 * Garante consistência em toda a aplicação
 */
export class OnboardingValidator {
  /**
   * Verifica se o onboarding foi completado
   * REGRA: onboarding_completed deve ser explicitamente true
   */
  static isCompleted(profile: UserProfile | null): boolean {
    if (!profile) {
      logger.warn('[ONBOARDING-VALIDATOR] Perfil não encontrado');
      return false;
    }

    const isCompleted = profile.onboarding_completed === true;
    
    logger.info('[ONBOARDING-VALIDATOR] Validação:', {
      profileId: profile.id.substring(0, 8) + '***',
      onboardingCompleted: profile.onboarding_completed,
      isCompleted,
      userRole: profile.user_roles?.name
    });

    return isCompleted;
  }

  /**
   * Verifica se onboarding é obrigatório para o usuário
   * REGRA CRÍTICA: Obrigatório para TODOS, sem exceção de role
   */
  static isRequired(profile: UserProfile | null): boolean {
    if (!profile) {
      logger.warn('[ONBOARDING-VALIDATOR] Perfil não encontrado - onboarding obrigatório');
      return true;
    }

    const isRequired = !this.isCompleted(profile);
    
    logger.info('[ONBOARDING-VALIDATOR] Verificação de obrigatoriedade:', {
      profileId: profile.id.substring(0, 8) + '***',
      userRole: profile.user_roles?.name,
      onboardingCompleted: profile.onboarding_completed,
      isRequired,
      note: 'SEM EXCEÇÕES PARA NENHUM ROLE'
    });

    return isRequired;
  }

  /**
   * Valida se usuário pode acessar área protegida
   */
  static canAccessProtectedArea(profile: UserProfile | null): boolean {
    return this.isCompleted(profile);
  }

  /**
   * Lista de rotas que requerem onboarding completo
   */
  static getProtectedRoutes(): string[] {
    return [
      '/dashboard',
      '/solutions',
      '/tools',
      '/learning',
      '/comunidade',
      '/profile',
      '/admin',
      '/formacao'
    ];
  }

  /**
   * Verifica se a rota atual requer onboarding
   */
  static routeRequiresOnboarding(pathname: string): boolean {
    return this.getProtectedRoutes().some(route => 
      pathname.startsWith(route)
    );
  }
}
