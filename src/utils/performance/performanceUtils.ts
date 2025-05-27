
export interface PerformanceThresholds {
  pageLoadTime: number;
  apiResponseTime: number;
  componentRenderTime: number;
  webVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
}

export const defaultThresholds: PerformanceThresholds = {
  pageLoadTime: 3000,
  apiResponseTime: 2000,
  componentRenderTime: 100,
  webVitals: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    fcp: 1800,
    ttfb: 800
  }
};

export const isSlowPerformance = (value: number, threshold: number): boolean => {
  return value > threshold;
};

export const getPerformanceRating = (
  value: number, 
  goodThreshold: number, 
  poorThreshold: number
): 'good' | 'needs-improvement' | 'poor' => {
  if (value <= goodThreshold) return 'good';
  if (value <= poorThreshold) return 'needs-improvement';
  return 'poor';
};

export const calculatePercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
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

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

export const getResourceLoadTime = (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    const img = new Image();
    
    img.onload = () => {
      const endTime = performance.now();
      resolve(endTime - startTime);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load resource: ${url}`));
    };
    
    img.src = url;
  });
};

export const measureAsyncOperation = async <T>(
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const endTime = performance.now();
    
    return {
      result,
      duration: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    throw {
      error,
      duration: endTime - startTime
    };
  }
};

export class PerformanceBuffer {
  private buffer: Array<{ timestamp: number; value: number }> = [];
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  add(value: number): void {
    this.buffer.push({
      timestamp: Date.now(),
      value
    });

    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  getAverage(): number {
    if (this.buffer.length === 0) return 0;
    
    const sum = this.buffer.reduce((acc, item) => acc + item.value, 0);
    return sum / this.buffer.length;
  }

  getPercentile(percentile: number): number {
    if (this.buffer.length === 0) return 0;
    
    const values = this.buffer.map(item => item.value);
    return calculatePercentile(values, percentile);
  }

  getRecent(timeWindow = 60000): number[] {
    const cutoff = Date.now() - timeWindow;
    return this.buffer
      .filter(item => item.timestamp > cutoff)
      .map(item => item.value);
  }

  clear(): void {
    this.buffer = [];
  }
}

export default {
  defaultThresholds,
  isSlowPerformance,
  getPerformanceRating,
  calculatePercentile,
  debounce,
  formatBytes,
  formatDuration,
  getResourceLoadTime,
  measureAsyncOperation,
  PerformanceBuffer
};
