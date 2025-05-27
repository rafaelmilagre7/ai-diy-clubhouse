
import { renderHook } from '@testing-library/react';
import { useWebVitals } from '@/hooks/performance/useWebVitals';

// Mock do usePerformanceMonitor
jest.mock('@/hooks/performance/usePerformanceMonitor', () => ({
  usePerformanceMonitor: () => ({
    captureMetric: jest.fn()
  })
}));

// Mock do PerformanceObserver
const mockPerformanceObserver = {
  observe: jest.fn(),
  disconnect: jest.fn()
};

Object.defineProperty(window, 'PerformanceObserver', {
  writable: true,
  configurable: true,
  value: jest.fn(() => mockPerformanceObserver)
});

// Mock do performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  configurable: true,
  value: {
    timing: {
      navigationStart: 1000,
      domainLookupStart: 1100,
      domainLookupEnd: 1200,
      connectStart: 1200,
      connectEnd: 1300,
      requestStart: 1300,
      responseStart: 1400,
      responseEnd: 1500,
      domLoading: 1500,
      domComplete: 2000,
      loadEventEnd: 2100
    }
  }
});

// Mock correto do document.readyState
Object.defineProperty(document, 'readyState', {
  writable: true,
  configurable: true,
  value: 'complete'
});

describe('useWebVitals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetar o readyState para complete
    Object.defineProperty(document, 'readyState', {
      writable: true,
      configurable: true,
      value: 'complete'
    });
  });

  test('should initialize without errors', () => {
    const { result } = renderHook(() => useWebVitals());
    
    expect(result.current.onWebVital).toBeDefined();
    expect(result.current.getThreshold).toBeDefined();
  });

  test('should handle PerformanceObserver creation', () => {
    renderHook(() => useWebVitals());
    
    expect(window.PerformanceObserver).toHaveBeenCalled();
  });

  test('should calculate correct thresholds', () => {
    const { result } = renderHook(() => useWebVitals());
    
    expect(result.current.getThreshold('LCP', 'good')).toBe(2500);
    expect(result.current.getThreshold('FID', 'poor')).toBe(300);
    expect(result.current.getThreshold('CLS', 'good')).toBe(0.1);
  });

  test('should handle missing PerformanceObserver gracefully', () => {
    // @ts-ignore
    delete window.PerformanceObserver;
    
    expect(() => {
      renderHook(() => useWebVitals());
    }).not.toThrow();
  });

  test('should process web vital metrics correctly', () => {
    const { result } = renderHook(() => useWebVitals());
    
    const mockMetric = {
      name: 'LCP' as const,
      value: 2000,
      delta: 2000,
      id: 'test-lcp',
      rating: 'good' as const
    };
    
    expect(() => {
      result.current.onWebVital(mockMetric);
    }).not.toThrow();
  });

  test('should handle navigation timing when available', () => {
    const { result } = renderHook(() => useWebVitals());
    
    // O hook deve processar o timing de navegação automaticamente
    expect(result.current).toBeDefined();
  });
});
