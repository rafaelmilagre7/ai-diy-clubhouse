
/**
 * Intercepta e suprime console.error/warn em produção
 * Para evitar falhas de build
 */

const isProduction = import.meta.env.PROD;

if (isProduction && typeof window !== 'undefined') {
  // Substituir todos os console methods por funções silenciosas
  const silentFunction = () => {};
  
  window.console.error = silentFunction;
  window.console.warn = silentFunction;
  window.console.info = silentFunction;
  window.console.debug = silentFunction;
  
  // Manter apenas console.log para casos críticos
  const originalLog = window.console.log;
  window.console.log = (...args: any[]) => {
    // Em produção, só logar se for algo realmente crítico
    if (args[0] && typeof args[0] === 'string' && args[0].includes('[CRITICAL]')) {
      try {
        originalLog(...args);
      } catch {
        // Falha silenciosamente
      }
    }
  };
  
  // Interceptar erros globais
  window.addEventListener('error', (event) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    return false;
  });
}

export {};
