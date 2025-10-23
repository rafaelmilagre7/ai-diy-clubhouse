import mermaid from 'mermaid';

/**
 * Obtém o valor real de uma variável CSS do :root
 */
const getCSSVar = (varName: string): string => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  
  if (value && !value.startsWith('hsl') && !value.startsWith('#')) {
    return `hsl(${value})`;
  }
  
  return value || '#1e293b';
};

/**
 * Manager singleton para Mermaid
 * Garante que a inicialização aconteça apenas UMA VEZ
 */
class MermaidManager {
  private static instance: MermaidManager;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): MermaidManager {
    if (!MermaidManager.instance) {
      MermaidManager.instance = new MermaidManager();
    }
    return MermaidManager.instance;
  }

  async initialize(): Promise<void> {
    // Se já está inicializado, retorna imediatamente
    if (this.initialized) {
      return Promise.resolve();
    }

    // Se está em processo de inicialização, retorna a promise existente
    if (this.initPromise) {
      return this.initPromise;
    }

    // Inicia o processo de inicialização
    this.initPromise = this.performInitialization();
    
    try {
      await this.initPromise;
      this.initialized = true;
    } catch (error) {
      console.error('[MermaidManager] Erro na inicialização:', error);
      this.initPromise = null; // Permite retry
      throw error;
    }

    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    console.log('[MermaidManager] Inicializando Mermaid (singleton)...');
    
    const primaryColor = getCSSVar('--primary');
    const primaryForeground = getCSSVar('--primary-foreground');
    const borderColor = getCSSVar('--border');
    const backgroundColor = getCSSVar('--background');
    const cardColor = getCSSVar('--card');
    const mutedColor = getCSSVar('--muted');
    const foregroundColor = getCSSVar('--foreground');
    const secondaryColor = getCSSVar('--secondary');
    const accentColor = getCSSVar('--accent');

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        darkMode: true,
        primaryColor: primaryColor,
        primaryTextColor: primaryForeground,
        primaryBorderColor: primaryColor,
        lineColor: borderColor,
        secondaryColor: secondaryColor,
        tertiaryColor: accentColor,
        background: backgroundColor,
        mainBkg: cardColor,
        secondBkg: mutedColor,
        textColor: foregroundColor,
        borderColor: borderColor,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
      },
      journey: {
        useMaxWidth: true,
      },
    });

    console.log('[MermaidManager] ✅ Mermaid inicializado com sucesso!');
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export da função de inicialização
export const initializeMermaid = async (): Promise<void> => {
  const manager = MermaidManager.getInstance();
  await manager.initialize();
};

export const isMermaidInitialized = (): boolean => {
  const manager = MermaidManager.getInstance();
  return manager.isInitialized();
};
