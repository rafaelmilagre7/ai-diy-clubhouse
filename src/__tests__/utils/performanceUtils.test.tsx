
import {
  isSlowPerformance,
  getPerformanceRating,
  calculatePercentile,
  formatBytes,
  formatDuration,
  PerformanceBuffer
} from '@/utils/performance/performanceUtils';

describe('Performance Utils', () => {
  describe('isSlowPerformance', () => {
    test('should identify slow performance correctly', () => {
      expect(isSlowPerformance(3500, 3000)).toBe(true);
      expect(isSlowPerformance(2500, 3000)).toBe(false);
      expect(isSlowPerformance(3000, 3000)).toBe(false);
    });
  });

  describe('getPerformanceRating', () => {
    test('should return correct ratings', () => {
      expect(getPerformanceRating(1000, 2000, 4000)).toBe('good');
      expect(getPerformanceRating(3000, 2000, 4000)).toBe('needs-improvement');
      expect(getPerformanceRating(5000, 2000, 4000)).toBe('poor');
    });
  });

  describe('calculatePercentile', () => {
    test('should calculate percentiles correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      expect(calculatePercentile(values, 50)).toBe(5);
      expect(calculatePercentile(values, 90)).toBe(9);
      expect(calculatePercentile(values, 95)).toBe(10);
    });

    test('should handle empty arrays', () => {
      expect(calculatePercentile([], 50)).toBe(0);
    });
  });

  describe('formatBytes', () => {
    test('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('formatDuration', () => {
    test('should format durations correctly', () => {
      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(65000)).toBe('1.1m');
    });
  });

  describe('PerformanceBuffer', () => {
    test('should add values and maintain size limit', () => {
      const buffer = new PerformanceBuffer(3);
      
      buffer.add(1);
      buffer.add(2);
      buffer.add(3);
      buffer.add(4); // Should remove first value
      
      expect(buffer.getAverage()).toBe(3); // (2+3+4)/3
    });

    test('should calculate percentiles correctly', () => {
      const buffer = new PerformanceBuffer(10);
      
      for (let i = 1; i <= 10; i++) {
        buffer.add(i);
      }
      
      expect(buffer.getPercentile(50)).toBe(5);
      expect(buffer.getPercentile(90)).toBe(9);
    });

    test('should filter recent values by time window', () => {
      const buffer = new PerformanceBuffer(10);
      
      // Adicionar alguns valores
      buffer.add(1);
      buffer.add(2);
      buffer.add(3);
      
      const recent = buffer.getRecent(60000); // Última hora
      expect(recent).toEqual([1, 2, 3]);
    });

    test('should clear buffer correctly', () => {
      const buffer = new PerformanceBuffer(5);
      
      buffer.add(1);
      buffer.add(2);
      buffer.clear();
      
      expect(buffer.getAverage()).toBe(0);
    });
  });
});
