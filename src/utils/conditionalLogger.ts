/**
 * FASE 4: Sistema de Logging Condicional
 * =====================================
 * 
 * Utilitário para logging inteligente baseado em ambiente
 * Remove logs de produção mantendo debugging no desenvolvimento
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isDebugEnabled = isDevelopment || localStorage.getItem('debug_mode') === 'true';

interface LogData {
  [key: string]: any;
}

/**
 * Logger condicional que só executa em desenvolvimento
 */
export const conditionalLogger = {
  log: (message: string, data?: LogData) => {
    if (isDebugEnabled) {
      console.log(message, data);
    }
  },
  
  warn: (message: string, data?: LogData) => {
    if (isDebugEnabled) {
      console.warn(message, data);
    }
  },
  
  error: (message: string, error?: any) => {
    // Erros sempre são logados por serem críticos
    console.error(message, error);
  },
  
  info: (message: string, data?: LogData) => {
    if (isDebugEnabled) {
      console.info(message, data);
    }
  },
  
  debug: (message: string, data?: LogData) => {
    if (isDebugEnabled) {
      console.debug(message, data);
    }
  },
  
  group: (label: string) => {
    if (isDebugEnabled) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (isDebugEnabled) {
      console.groupEnd();
    }
  }
};

/**
 * Função para habilitar debug mode em produção (uso administrativo)
 */
export const enableDebugMode = () => {
  localStorage.setItem('debug_mode', 'true');
  console.log('🐛 Debug mode habilitado');
};

/**
 * Função para desabilitar debug mode
 */
export const disableDebugMode = () => {
  localStorage.removeItem('debug_mode');
  console.log('🐛 Debug mode desabilitado');
};

export default conditionalLogger;