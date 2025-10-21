/**
 * Sistema de Logging Inteligente para Desenvolvimento
 * - Só funciona em desenvolvimento
 * - Silencioso em produção
 * - Organizado por categorias
 * - Não afeta performance
 */

const isDev = import.meta.env.DEV;

/**
 * Logger silencioso que não faz nada em produção
 */
class DevLogger {
  private log(emoji: string, category: string, message: string, data?: any) {
    if (!isDev) return;
    
    try {
      const prefix = `${emoji} [${category}]`;
      if (data !== undefined) {
        console.log(prefix, message, data);
      } else {
        console.log(prefix, message);
      }
    } catch {
      // Falha silenciosa
    }
  }

  // Logs de componentes
  component(message: string, data?: any) {
    this.log('🎨', 'COMPONENT', message, data);
  }

  // Logs de API/Network
  api(message: string, data?: any) {
    this.log('🌐', 'API', message, data);
  }

  // Logs de dados/estado
  data(message: string, data?: any) {
    this.log('📊', 'DATA', message, data);
  }

  // Logs de timing/performance
  timing(message: string, data?: any) {
    this.log('⏱️', 'TIMING', message, data);
  }

  // Logs de auth
  auth(message: string, data?: any) {
    this.log('🔐', 'AUTH', message, data);
  }

  // Logs de debug geral
  debug(message: string, data?: any) {
    this.log('🔍', 'DEBUG', message, data);
  }

  // Logs de sucesso
  success(message: string, data?: any) {
    this.log('✅', 'SUCCESS', message, data);
  }

  // Logs de warning (mantido mesmo em prod para casos críticos)
  warn(message: string, data?: any) {
    if (!isDev) return;
    try {
      console.warn('⚠️ [WARN]', message, data || '');
    } catch {}
  }

  // Logs de erro (mantido em prod para debugging)
  error(message: string, data?: any) {
    try {
      const prefix = isDev ? '❌ [ERROR]' : '[ERROR]';
      console.error(prefix, message, data || '');
    } catch {}
  }

  // Helper para medir tempo de execução
  timeStart(label: string) {
    if (!isDev) return;
    try {
      console.time(`⏱️ ${label}`);
    } catch {}
  }

  timeEnd(label: string) {
    if (!isDev) return;
    try {
      console.timeEnd(`⏱️ ${label}`);
    } catch {}
  }

  // Logs em grupo (colapsável)
  group(label: string, callback: () => void) {
    if (!isDev) return;
    try {
      console.group(`📦 ${label}`);
      callback();
      console.groupEnd();
    } catch {}
  }
}

export const devLog = new DevLogger();

/**
 * Helper para migração: substitui console.log sem quebrar funcionalidade
 */
export const safeConsoleLog = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};
