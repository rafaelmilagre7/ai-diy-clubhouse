/**
 * Sistema de monitoramento e tratamento de erros de recursos
 * Para identificar e resolver problemas de 400/404 e outros erros
 */

interface ResourceError {
  url: string;
  status: number;
  type: string;
  timestamp: number;
}

class ResourceErrorHandler {
  private errors: ResourceError[] = [];
  private maxErrors = 50;

  constructor() {
    this.setupErrorListeners();
  }

  private setupErrorListeners() {
    // Monitorar erros de recursos (imagens, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        const url = (target as any).src || (target as any).href;
        
        if (url) {
          this.logError({
            url,
            status: 0,
            type: 'resource_load_error',
            timestamp: Date.now()
          });
          
          console.warn('🔴 [RESOURCE-ERROR] Falha ao carregar recurso:', url);
          
          // Tentar remover elementos problemáticos
          this.handleBrokenResource(target, url);
        }
      }
    }, true);

    // Monitorar erros de fetch/network
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok && response.status >= 400) {
          this.logError({
            url: args[0] as string,
            status: response.status,
            type: 'fetch_error',
            timestamp: Date.now()
          });
          
          console.warn(`🔴 [FETCH-ERROR] ${response.status} para:`, args[0]);
        }
        
        return response;
      } catch (error) {
        this.logError({
          url: args[0] as string,
          status: 0,
          type: 'fetch_network_error',
          timestamp: Date.now()
        });
        
        console.error('🔴 [NETWORK-ERROR] Erro de rede:', args[0], error);
        throw error;
      }
    };
  }

  private logError(error: ResourceError) {
    this.errors.push(error);
    
    // Manter apenas os últimos N erros
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  private handleBrokenResource(element: HTMLElement, url: string) {
    // Remover imagens quebradas
    if (element.tagName === 'IMG') {
      console.log('🔧 [RESOURCE-FIX] Removendo imagem quebrada:', url);
      element.style.display = 'none';
      element.setAttribute('data-broken', 'true');
    }
    
    // Remover links de preload problemáticos
    if (element.tagName === 'LINK' && (element as HTMLLinkElement).rel === 'preload') {
      console.log('🔧 [RESOURCE-FIX] Removendo preload quebrado:', url);
      element.remove();
    }
  }

  public getErrors(): ResourceError[] {
    return [...this.errors];
  }

  public getErrorSummary() {
    const summary = {
      total: this.errors.length,
      by_status: {} as Record<number, number>,
      by_type: {} as Record<string, number>,
      recent: this.errors.filter(e => Date.now() - e.timestamp < 60000).length
    };

    this.errors.forEach(error => {
      summary.by_status[error.status] = (summary.by_status[error.status] || 0) + 1;
      summary.by_type[error.type] = (summary.by_type[error.type] || 0) + 1;
    });

    return summary;
  }

  public clearErrors() {
    this.errors = [];
  }

  public reportProblematicUrls(): string[] {
    const urlCounts: Record<string, number> = {};
    
    this.errors.forEach(error => {
      urlCounts[error.url] = (urlCounts[error.url] || 0) + 1;
    });

    return Object.entries(urlCounts)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .map(([url, _]) => url);
  }
}

// Instância global
export const resourceErrorHandler = new ResourceErrorHandler();

// Função para debug no console
(window as any).checkResourceErrors = () => {
  const summary = resourceErrorHandler.getErrorSummary();
  const problematic = resourceErrorHandler.reportProblematicUrls();
  
  console.group('📊 [RESOURCE-ERRORS] Relatório de Erros');
  console.log('Resumo:', summary);
  console.log('URLs Problemáticas:', problematic);
  console.log('Todos os Erros:', resourceErrorHandler.getErrors());
  console.groupEnd();
  
  return { summary, problematic, all: resourceErrorHandler.getErrors() };
};

// Auto-relatório a cada 30 segundos em desenvolvimento
if (import.meta.env.DEV) {
  setInterval(() => {
    const summary = resourceErrorHandler.getErrorSummary();
    if (summary.recent > 0) {
      console.warn(`⚠️ [RESOURCE-MONITOR] ${summary.recent} novos erros de recursos nos últimos 60s`);
    }
  }, 30000);
}