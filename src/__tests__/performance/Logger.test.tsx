
import { logger } from '@/utils/logger';

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock do console
const originalConsole = { ...console };
beforeEach(() => {
  console.debug = jest.fn();
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  logger.clearBuffer();
});

afterEach(() => {
  Object.assign(console, originalConsole);
  jest.clearAllMocks();
});

describe('Logger', () => {
  test('should log debug messages in development', () => {
    // Simular ambiente de desenvolvimento
    Object.defineProperty(import.meta, 'env', {
      value: { DEV: true },
      writable: true
    });
    
    logger.debug('Test debug message', { test: true });
    
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining('🐛 [Unknown] Test debug message'),
      { test: true }
    );
  });

  test('should not log debug messages in production', () => {
    // Simular ambiente de produção
    Object.defineProperty(import.meta, 'env', {
      value: { DEV: false },
      writable: true
    });
    
    logger.debug('Test debug message');
    
    expect(console.debug).not.toHaveBeenCalled();
  });

  test('should always log critical messages', () => {
    logger.critical('Critical error', { error: 'test' });
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('🚨 [CRITICAL] [Unknown] Critical error'),
      { error: 'test' }
    );
  });

  test('should store logs in buffer', () => {
    logger.info('Test message');
    
    const buffer = logger.getBuffer();
    expect(buffer).toHaveLength(1);
    expect(buffer[0].message).toBe('Test message');
    expect(buffer[0].level).toBe('info');
  });

  test('should use performance logging', () => {
    logger.performance('Performance metric', { duration: 100 });
    
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining('⚡ [PERFORMANCE] [Unknown] Performance metric'),
      { duration: 100 }
    );
  });

  test('should handle buffer overflow', () => {
    // Configurar buffer pequeno para teste
    logger.setConfig({ maxBufferSize: 2 });
    
    logger.info('Message 1');
    logger.info('Message 2');
    logger.info('Message 3'); // Deve remover a primeira
    
    const buffer = logger.getBuffer();
    expect(buffer).toHaveLength(2);
    expect(buffer[0].message).toBe('Message 2');
    expect(buffer[1].message).toBe('Message 3');
  });

  test('should safely handle user ID extraction', () => {
    localStorageMock.getItem.mockReturnValue('{"user":{"id":"test-user-123"}}');
    
    logger.info('Test with user');
    
    const buffer = logger.getBuffer();
    expect(buffer[0].userId).toBe('test-user-123');
  });

  test('should handle malformed localStorage data', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');
    
    expect(() => {
      logger.info('Test with invalid storage');
    }).not.toThrow();
    
    const buffer = logger.getBuffer();
    expect(buffer[0].userId).toBeUndefined();
  });

  test('should clear buffer when requested', () => {
    logger.info('Test message');
    expect(logger.getBuffer()).toHaveLength(1);
    
    logger.clearBuffer();
    expect(logger.getBuffer()).toHaveLength(0);
  });

  test('should filter logs by level', () => {
    logger.info('Info message');
    logger.error('Error message');
    logger.warn('Warning message');
    
    const errorLogs = logger.getLogs('error');
    expect(errorLogs).toHaveLength(1);
    expect(errorLogs[0].level).toBe('error');
  });

  test('should filter logs by component', () => {
    logger.info('Message 1');
    logger.info('Message 2');
    logger.info('Message 3');
    
    const unknownLogs = logger.getLogs(undefined, 'Unknown');
    expect(unknownLogs).toHaveLength(3);
    expect(unknownLogs.every(log => log.component === 'Unknown')).toBe(true);
  });

  test('should export logs as JSON', () => {
    logger.info('Test message');
    const exported = logger.exportLogs();
    
    expect(() => JSON.parse(exported)).not.toThrow();
    const parsed = JSON.parse(exported);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].message).toBe('Test message');
  });

  test('should get recent errors', () => {
    logger.error('Error 1');
    logger.info('Info message');
    logger.critical('Critical error');
    
    const recentErrors = logger.getRecentErrors();
    expect(recentErrors).toHaveLength(2);
    expect(recentErrors.every(log => log.level === 'error' || log.level === 'critical')).toBe(true);
  });
});
