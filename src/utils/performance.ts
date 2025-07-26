// Utilitários de performance para a trilha de implementação

export const memoizeWithTTL = <T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 300000 // 5 minutos por padrão
) => {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value;
    }
    
    const value = fn(...args);
    cache.set(key, { value, timestamp: now });
    
    // Limpeza automática de cache antigo
    if (cache.size > 50) {
      const entries = Array.from(cache.entries());
      entries
        .filter(([, { timestamp }]) => (now - timestamp) >= ttl)
        .forEach(([key]) => cache.delete(key));
    }
    
    return value;
  }) as T;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};