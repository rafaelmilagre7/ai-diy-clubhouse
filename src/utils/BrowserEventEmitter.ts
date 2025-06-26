
/**
 * Implementação leve de EventEmitter para browser
 * Substitui a dependência do Node.js 'events' por uma solução nativa
 */
export class BrowserEventEmitter<T extends Record<string, (...args: any[]) => void>> {
  private listeners: Map<keyof T, Set<(...args: any[]) => void>> = new Map();

  /**
   * Adiciona um listener para um evento
   */
  on<K extends keyof T>(event: K, callback: T[K]): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    const eventListeners = this.listeners.get(event)!;
    eventListeners.add(callback as (...args: any[]) => void);
    
    // Retorna função de cleanup
    return () => this.off(event, callback);
  }

  /**
   * Remove um listener específico de um evento
   */
  off<K extends keyof T>(event: K, callback: T[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback as (...args: any[]) => void);
      
      // Limpa o Set se não há mais listeners
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emite um evento para todos os listeners
   */
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      // Criar array para evitar modificação durante iteração
      const listenersArray = Array.from(eventListeners);
      listenersArray.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${String(event)}:`, error);
        }
      });
    }
  }

  /**
   * Remove todos os listeners de um evento específico
   */
  removeAllListeners<K extends keyof T>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Retorna o número de listeners para um evento
   */
  listenerCount<K extends keyof T>(event: K): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * Retorna todos os eventos que têm listeners
   */
  eventNames(): Array<keyof T> {
    return Array.from(this.listeners.keys());
  }
}
