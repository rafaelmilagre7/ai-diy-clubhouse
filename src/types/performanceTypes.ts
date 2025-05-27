
export interface PerformanceAlert {
  id: string;
  type: 'performance' | 'memory' | 'network' | 'error' | 'warning';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface RealTimeStats {
  activeQueries: number;
  avgResponseTime: number;
  memoryUsage: number;
  errorRate: number;
  cacheHitRate: number;
}

export interface QueryStats {
  totalQueries: number;
  successRate: number;
  errorRate: number;
  cacheHitRate: number;
  avgDuration: number;
  slowQueriesCount: number;
  slowestQueries: any[];
  mostErrorQueries: any[];
  last24hCount: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  context?: string;
  metadata?: Record<string, any>;
  timestamp?: number;
}

export interface AlertThresholds {
  slowQueryMs: number;
  highErrorRate: number;
  lowCacheHitRate: number;
}
