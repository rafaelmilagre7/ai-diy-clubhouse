/**
 * Sistema de correção automática de problemas de onboarding
 * Para diagnosticar e corrigir loops e inconsistências
 */

import { supabase } from '@/integrations/supabase/client';

interface OnboardingDiagnostic {
  userId: string;
  profileExists: boolean;
  profileOnboardingCompleted: boolean;
  onboardingFinalExists: boolean;
  onboardingFinalCompleted: boolean;
  hasInconsistency: boolean;
  issues: string[];
  timestamp: number;
}

class OnboardingFixer {
  private diagnostics: OnboardingDiagnostic[] = [];
  private isFixing = false;
  private lastCheck: Record<string, number> = {};

  async diagnoseUser(userId: string): Promise<OnboardingDiagnostic> {
    console.log('🔍 [FIXER] Diagnosticando usuário:', userId);

    const diagnostic: OnboardingDiagnostic = {
      userId,
      profileExists: false,
      profileOnboardingCompleted: false,
      onboardingFinalExists: false,
      onboardingFinalCompleted: false,
      hasInconsistency: false,
      issues: [],
      timestamp: Date.now()
    };

    try {
      // Verificar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();

      if (profileError) {
        diagnostic.issues.push(`Erro ao buscar perfil: ${profileError.message}`);
      } else if (profile) {
        diagnostic.profileExists = true;
        diagnostic.profileOnboardingCompleted = profile.onboarding_completed || false;
      }

      // Verificar onboarding_final
      const { data: onboarding, error: onboardingError } = await supabase
        .from('onboarding_final')
        .select('is_completed')
        .eq('user_id', userId)
        .single();

      if (onboardingError && onboardingError.code !== 'PGRST116') {
        diagnostic.issues.push(`Erro ao buscar onboarding: ${onboardingError.message}`);
      } else if (onboarding) {
        diagnostic.onboardingFinalExists = true;
        diagnostic.onboardingFinalCompleted = onboarding.is_completed || false;
      }

      // Detectar inconsistências
      if (diagnostic.profileExists && diagnostic.onboardingFinalExists) {
        if (diagnostic.profileOnboardingCompleted !== diagnostic.onboardingFinalCompleted) {
          diagnostic.hasInconsistency = true;
          diagnostic.issues.push('Inconsistência entre profile.onboarding_completed e onboarding_final.is_completed');
        }
      }

      if (diagnostic.profileExists && !diagnostic.onboardingFinalExists) {
        diagnostic.issues.push('Usuário tem perfil mas não tem onboarding_final');
      }

      this.diagnostics.push(diagnostic);
      return diagnostic;

    } catch (error) {
      diagnostic.issues.push(`Erro inesperado: ${error}`);
      return diagnostic;
    }
  }

  async fixInconsistency(userId: string): Promise<boolean> {
    if (this.isFixing) {
      console.warn('🔄 [FIXER] Correção já em andamento...');
      return false;
    }

    this.isFixing = true;
    console.log('🔧 [FIXER] Iniciando correção para usuário:', userId);

    try {
      // Verificar progresso real usando função do banco
      const { data: progressData, error: progressError } = await supabase.rpc('get_onboarding_next_step', {
        p_user_id: userId
      });

      if (progressError) {
        console.error('❌ [FIXER] Erro ao verificar progresso:', progressError);
        return false;
      }

      console.log('📊 [FIXER] Progresso do onboarding:', progressData);

      // Se o onboarding está realmente completo, sincronizar
      if (progressData?.is_completed) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ [FIXER] Erro ao atualizar perfil:', updateError);
          return false;
        }

        console.log('✅ [FIXER] Perfil sincronizado com sucesso');
        return true;
      } else {
        console.log('ℹ️ [FIXER] Onboarding não está completo, nenhuma correção necessária');
        return false;
      }

    } catch (error) {
      console.error('❌ [FIXER] Erro na correção:', error);
      return false;
    } finally {
      this.isFixing = false;
    }
  }

  async checkAndFixIfNeeded(userId: string): Promise<void> {
    // Throttle: só verificar uma vez a cada 5 segundos por usuário
    const now = Date.now();
    const lastCheckTime = this.lastCheck[userId] || 0;
    
    if (now - lastCheckTime < 5000) {
      return;
    }
    
    this.lastCheck[userId] = now;
    
    console.log('🔍 [FIXER] Verificando consistência do onboarding...', { userId });

    const diagnostic = await this.diagnoseUser(userId);

    if (diagnostic.hasInconsistency || diagnostic.issues.length > 0) {
      console.warn('⚠️ [FIXER] Problemas detectados:', diagnostic.issues);
      
      if (diagnostic.hasInconsistency) {
        const fixed = await this.fixInconsistency(userId);
        if (fixed) {
          console.log('✅ [FIXER] Inconsistência corrigida');
        }
      }
    } else {
      console.log('✅ [FIXER] Onboarding já está correto e sincronizado');
    }
  }

  getDiagnostics(): OnboardingDiagnostic[] {
    return [...this.diagnostics];
  }

  clearDiagnostics(): void {
    this.diagnostics = [];
    this.lastCheck = {};
  }
}

// Instância global
export const onboardingFixer = new OnboardingFixer();

// Função para debug no console
(window as any).checkOnboarding = (userId?: string) => {
  if (!userId) {
    console.log('📊 [ONBOARDING-FIXER] Diagnósticos:', onboardingFixer.getDiagnostics());
    return onboardingFixer.getDiagnostics();
  }
  
  return onboardingFixer.diagnoseUser(userId);
};

(window as any).fixOnboarding = (userId: string) => {
  return onboardingFixer.fixInconsistency(userId);
};