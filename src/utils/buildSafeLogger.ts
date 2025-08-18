
/**
 * Sistema de logging seguro para build
 * Remove todos os logs em produção para evitar falhas de build
 */

const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// Função silenciosa para produção
const silentLog = () => {};

export const buildSafeLogger = {
  info: isDevelopment ? console.info : silentLog,
  warn: isDevelopment ? console.warn : silentLog,
  error: isDevelopment ? console.error : silentLog,
  debug: isDevelopment ? console.debug : silentLog,
  log: isDevelopment ? console.log : silentLog
};

// Override global console em produção
if (isProduction) {
  window.console.error = silentLog;
  window.console.warn = silentLog;
  window.console.info = silentLog;
  window.console.debug = silentLog;
}

// Função para logging seguro com fallback
export const safeLog = (level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) => {
  if (isDevelopment) {
    try {
      buildSafeLogger[level](message, data);
    } catch {
      // Falhou silenciosamente
    }
  }
};
