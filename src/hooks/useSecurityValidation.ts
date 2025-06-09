
import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { auditLogger } from '@/utils/auditLogger';
import { environmentSecurity } from '@/utils/environmentSecurity';
import { validateSecureInput } from '@/utils/validation';
import { detectInjectionAttempts } from '@/utils/securityUtils';
import { logger } from '@/utils/logger';

// Hook para validação de segurança em tempo real
export const useSecurityValidation = () => {
  const { user } = useAuth();

  // Validar entrada de dados de forma segura
  const validateInput = useCallback(async (input: string, type: 'email' | 'password' | 'name' | 'text' = 'text') => {
    try {
      // Detectar tentativas de injeção
      if (detectInjectionAttempts(input)) {
        await auditLogger.logSecurityEvent('input_injection_attempt', 'high', {
          inputType: type,
          inputLength: input.length,
          suspiciousContent: input.substring(0, 50) + '...'
        }, user?.id);
        
        return {
          isValid: false,
          error: 'Entrada contém conteúdo potencialmente perigoso'
        };
      }

      // Validar com schema apropriado
      const validation = validateSecureInput(input, type);
      
      if (!validation.isValid) {
        await auditLogger.logSecurityEvent('input_validation_failed', 'low', {
          inputType: type,
          validationError: validation.error
        }, user?.id);
      }

      return validation;
    } catch (error) {
      logger.error("Erro na validação de segurança", {
        component: 'SECURITY_VALIDATION',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      return {
        isValid: false,
        error: 'Erro interno de validação'
      };
    }
  }, [user]);

  // Verificar integridade do ambiente
  const validateEnvironment = useCallback(async () => {
    try {
      const validation = environmentSecurity.validateEnvironment();
      
      if (!validation.isValid) {
        await auditLogger.logSecurityEvent('environment_validation_failed', 'critical', {
          errors: validation.errors,
          warnings: validation.warnings
        }, user?.id);
      }
      
      return validation;
    } catch (error) {
      logger.error("Erro na validação de ambiente", {
        component: 'SECURITY_VALIDATION',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      return {
        isValid: false,
        errors: ['Erro interno de validação'],
        warnings: []
      };
    }
  }, [user]);

  // Verificar se pode executar ação administrativa
  const validateAdminAction = useCallback(async (action: string) => {
    try {
      if (!user) {
        await auditLogger.logSecurityEvent('unauthorized_admin_attempt', 'high', {
          action,
          reason: 'user_not_authenticated'
        });
        return false;
      }

      // Aqui você pode adicionar lógica adicional de validação de admin
      // Por exemplo, verificar permissões específicas
      
      await auditLogger.logAdminEvent(`admin_action_${action}`, {
        action,
        timestamp: new Date().toISOString()
      }, user.id);
      
      return true;
    } catch (error) {
      logger.error("Erro na validação de ação administrativa", {
        component: 'SECURITY_VALIDATION',
        action,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return false;
    }
  }, [user]);

  // Verificações automáticas quando o usuário muda
  useEffect(() => {
    if (user) {
      // Verificar ambiente automaticamente quando usuário faz login
      validateEnvironment();
    }
  }, [user, validateEnvironment]);

  return {
    validateInput,
    validateEnvironment,
    validateAdminAction
  };
};
