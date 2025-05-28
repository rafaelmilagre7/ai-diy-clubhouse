
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
    
    logger.debug('TestComponent', 'Test debug message', { test: true });
    
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining('🐛 [TestComponent] Test debug message'),
      { test: true }
    );
  });

  test('should not log debug messages in production', () => {
    // Simular ambiente de produção
    Object.defineProperty(import.meta, 'env', {
      value: { DEV: false },
      writable: true
    });
    
    logger.debug('TestComponent', 'Test debug message');
    
    expect(console.debug).not.toHaveBeenCalled();
  });

  test('should always log critical messages', () => {
    logger.critical('TestComponent', 'Critical error', { error: 'test' });
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('🚨 [CRITICAL] [TestComponent] Critical error'),
      { error: 'test' }
    );
  });

  test('should store logs in buffer', () => {
    logger.info('TestComponent', 'Test message');
    
    const buffer = logger.getBuffer();
    expect(buffer).toHaveLength(1);
    expect(buffer[0].message).toBe('Test message');
    expect(buffer[0].level).toBe('info');
  });

  test('should use context-specific methods', () => {
    logger.performance('TestComponent', 'Performance metric', { duration: 100 });
    
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining('⚡ [PERFORMANCE] [TestComponent] Performance metric'),
      { duration: 100 }
    );
  });

  test('should handle buffer overflow', () => {
    // Configurar buffer pequeno para teste
    logger.setConfig({ maxBufferSize: 2 });
    
    logger.info('TestComponent', 'Message 1');
    logger.info('TestComponent', 'Message 2');
    logger.info('TestComponent', 'Message 3'); // Deve remover a primeira
    
    const buffer = logger.getBuffer();
    expect(buffer).toHaveLength(2);
    expect(buffer[0].message).toBe('Message 2');
    expect(buffer[1].message).toBe('Message 3');
  });

  test('should safely handle user ID extraction', () => {
    localStorageMock.getItem.mockReturnValue('{"user":{"id":"test-user-123"}}');
    
    logger.info('TestComponent', 'Test with user');
    
    const buffer = logger.getBuffer();
    expect(buffer[0].userId).toBe('test-user-123');
  });

  test('should handle malformed localStorage data', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');
    
    expect(() => {
      logger.info('TestComponent', 'Test with invalid storage');
    }).not.toThrow();
    
    const buffer = logger.getBuffer();
    expect(buffer[0].userId).toBeUndefined();
  });

  test('should clear buffer when requested', () => {
    logger.info('TestComponent', 'Test message');
    expect(logger.getBuffer()).toHaveLength(1);
    
    logger.clearBuffer();
    expect(logger.getBuffer()).toHaveLength(0);
  });

  test('should filter logs by level', () => {
    logger.info('TestComponent', 'Info message');
    logger.error('TestComponent', 'Error message');
    logger.warn('TestComponent', 'Warning message');
    
    const errorLogs = logger.getLogs('error');
    expect(errorLogs).toHaveLength(1);
    expect(errorLogs[0].level).toBe('error');
  });

  test('should filter logs by component', () => {
    logger.info('Component1', 'Message 1');
    logger.info('Component2', 'Message 2');
    logger.info('Component1', 'Message 3');
    
    const component1Logs = logger.getLogs(undefined, 'Component1');
    expect(component1Logs).toHaveLength(2);
    expect(component1Logs.every(log => log.component === 'Component1')).toBe(true);
  });
});
