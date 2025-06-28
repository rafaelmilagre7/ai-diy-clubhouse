
import { logger } from '@/utils/logger';

export class EmergencyReset {
  static async performFullReset(): Promise<void> {
    logger.warn('[EMERGENCY-RESET] Iniciando reset completo do sistema');
    
    try {
      // Limpar localStorage
      Object.keys(localStorage).forEach(key => {
        if (
          key.startsWith('supabase') ||
          key.startsWith('sb-') ||
          key.includes('auth') ||
          key.includes('viverdeia') ||
          key.includes('session')
        ) {
          localStorage.removeItem(key);
        }
      });
      
      // Limpar sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Limpar cache do browser se possível
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      logger.info('[EMERGENCY-RESET] Reset completo realizado com sucesso');
      
      // Recarregar a página
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
    } catch (error) {
      logger.error('[EMERGENCY-RESET] Erro durante reset:', error);
      window.location.reload();
    }
  }
  
  static isInEmergencyState(): boolean {
    return localStorage.getItem('emergency_reset_needed') === 'true';
  }
  
  static markEmergencyState(): void {
    localStorage.setItem('emergency_reset_needed', 'true');
  }
  
  static clearEmergencyState(): void {
    localStorage.removeItem('emergency_reset_needed');
  }
}
