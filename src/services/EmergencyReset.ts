
import { logger } from '@/utils/logger';
import { supabase } from '@/lib/supabase';

export class EmergencyReset {
  static async performFullReset(): Promise<void> {
    logger.warn('[EMERGENCY-RESET] Iniciando reset completo do sistema');
    
    try {
      // 1. Limpar todas as chaves de localStorage
      const keysToRemove: string[] = [];
      Object.keys(localStorage).forEach(key => {
        if (
          key.startsWith('supabase') ||
          key.startsWith('sb-') ||
          key.includes('auth') ||
          key.includes('viverdeia') ||
          key.includes('session')
        ) {
          keysToRemove.push(key);
        }
      });
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        logger.debug('[EMERGENCY-RESET] Removida chave:', key);
      });
      
      // 2. Limpar sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // 3. Tentar signOut forçado
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        logger.warn('[EMERGENCY-RESET] Erro no signOut, continuando...', error);
      }
      
      // 4. Limpar cache do browser se possível
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      logger.info('[EMERGENCY-RESET] Reset completo realizado com sucesso');
      
      // 5. Aguardar um momento e recarregar
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
    } catch (error) {
      logger.error('[EMERGENCY-RESET] Erro durante reset:', error);
      // Fallback: reload forçado
      window.location.reload();
    }
  }
  
  static isInEmergencyState(): boolean {
    // Detectar se estamos em estado de emergência
    const indicators = [
      localStorage.getItem('emergency_reset_needed'),
      performance.now() > 30000, // Mais de 30s na página
      document.title.includes('Verificando') // Stuck na tela de loading
    ];
    
    return indicators.some(Boolean);
  }
  
  static markEmergencyState(): void {
    localStorage.setItem('emergency_reset_needed', 'true');
  }
  
  static clearEmergencyState(): void {
    localStorage.removeItem('emergency_reset_needed');
  }
}
