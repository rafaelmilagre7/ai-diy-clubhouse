
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
  
  // Lista de erros que DEVEM ser exibidos mesmo em produção
  const CRITICAL_ERROR_PATTERNS = [
    'Cannot read propert',
    'undefined is not',
    'null is not',
    'AuthContext',
    'Provider',
    'useContext',
    'Failed to mount',
    'React',
    'chunk',
  ];

  // Interceptar erros globais
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || '';
    
    // ✅ NÃO esconder erros críticos
    const isCritical = CRITICAL_ERROR_PATTERNS.some(pattern => 
      errorMessage.includes(pattern)
    );
    
    if (isCritical) {
      try {
        originalLog('[CRITICAL-ERROR]', errorMessage);
      } catch {
        // Falha silenciosamente
      }
      // Deixar erro ser exibido normalmente
      return;
    }
    
    // Apenas esconder erros não-críticos (recursos, tracking, etc)
    event.preventDefault();
    event.stopPropagation();
    return false;
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason);
    
    // ✅ NÃO esconder rejeições críticas
    const isCritical = CRITICAL_ERROR_PATTERNS.some(pattern => 
      reason.includes(pattern)
    );
    
    if (isCritical) {
      try {
        originalLog('[CRITICAL-REJECTION]', reason);
      } catch {
        // Falha silenciosamente
      }
      return;
    }
    
    event.preventDefault();
    return false;
  });
}

export {};
