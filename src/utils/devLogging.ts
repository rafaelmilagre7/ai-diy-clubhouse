
/**
 * Sistema de logging seguro para desenvolvimento
 * Evita logs em produção enquanto mantém debugging local
 */

const isDevelopment = import.meta.env.DEV;

export const devLog = {
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[Onboarding:INFO] ${message}`, data || '');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[Onboarding:WARN] ${message}`, data || '');
    }
  },
  
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(`[Onboarding:ERROR] ${message}`, error || '');
    }
  },
  
  debug: (step: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[Onboarding:DEBUG] Step ${step}`, data || '');
    }
  }
};
