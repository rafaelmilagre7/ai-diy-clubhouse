
import { renderHook, act } from '@testing-library/react';
import { useResponsive, useIsMobile } from '@/hooks/useResponsive';

// Mock do window
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setTimeout: jest.fn((cb) => cb()),
  clearTimeout: jest.fn()
};

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Mock do performance.now
Object.defineProperty(window, 'performance', {
  writable: true,
  configurable: true,
  value: {
    now: jest.fn(() => Date.now())
  }
});

describe('useResponsive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.innerWidth = 1024;
    window.innerHeight = 768;
  });

  test('should return initial desktop state', () => {
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current).toEqual({
      isMobile: false,
      width: 1024,
      height: 768
    });
  });

  test('should detect mobile breakpoint', () => {
    window.innerWidth = 600;
    
    const { result } = renderHook(() => useResponsive({ mobileBreakpoint: 768 }));
    
    expect(result.current.isMobile).toBe(true);
    expect(result.current.width).toBe(600);
  });

  test('should handle custom mobile breakpoint', () => {
    window.innerWidth = 800;
    
    const { result } = renderHook(() => useResponsive({ mobileBreakpoint: 900 }));
    
    expect(result.current.isMobile).toBe(true);
  });

  test('should add and remove event listeners', () => {
    const addEventListener = jest.spyOn(window, 'addEventListener');
    const removeEventListener = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useResponsive());
    
    expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function), { passive: true });
    
    unmount();
    
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  test('should use custom debounce time', () => {
    const { result } = renderHook(() => useResponsive({ debounceMs: 500 }));
    
    expect(result.current).toBeDefined();
    // O teste completo de debounce requereria mocks mais sofisticados do timer
  });
});

describe('useIsMobile', () => {
  test('should return mobile state only', () => {
    window.innerWidth = 600;
    
    const { result } = renderHook(() => useIsMobile(768));
    
    expect(result.current).toBe(true);
  });

  test('should return desktop state', () => {
    window.innerWidth = 1024;
    
    const { result } = renderHook(() => useIsMobile(768));
    
    expect(result.current).toBe(false);
  });
});
