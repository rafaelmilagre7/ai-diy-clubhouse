// Utilitário para suprimir erros não-críticos do console durante desenvolvimento
export const suppressNonCriticalErrors = () => {
  if (typeof window === 'undefined') return;
  
  // Capturar erros de storage não críticos
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Suprimir erros conhecidos não críticos
    if (
      message.includes('X-Frame-Options') ||
      message.includes('storage/bucket') ||
      message.includes('Failed to load resource') ||
      message.includes('ERR_BLOCKED_BY_CLIENT')
    ) {
      return; // Não exibir estes erros
    }
    
    // Exibir outros erros normalmente
    originalError.apply(console, args);
  };
  
  // Capturar warnings não críticos
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    
    if (
      message.includes('X-Frame-Options') ||
      message.includes('CSP')
    ) {
      return; // Não exibir estes warnings
    }
    
    originalWarn.apply(console, args);
  };
};

// Auto-inicializar em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  suppressNonCriticalErrors();
}