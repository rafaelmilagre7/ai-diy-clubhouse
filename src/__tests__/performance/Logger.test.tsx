
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
  console.info = jest.fn();
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
    process.env.NODE_ENV = 'development';
    
    logger.debug('Test debug message', { test: true });
    
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining('DEBUG: Test debug message'),
      { test: true }
    );
  });

  test('should not log debug messages in production', () => {
    // Simular ambiente de produção
    process.env.NODE_ENV = 'production';
    
    logger.debug('Test debug message');
    
    expect(console.debug).not.toHaveBeenCalled();
  });

  test('should always log critical messages', () => {
    logger.critical('Critical error', { error: 'test' });
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[CRITICAL]'),
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

  test('should use context-specific methods', () => {
    logger.performance('Performance metric', { duration: 100 });
    
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining('[PERFORMANCE]'),
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
});
