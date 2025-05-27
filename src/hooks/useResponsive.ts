
import { useState, useEffect, useCallback } from 'react';

interface ResponsiveConfig {
  mobileBreakpoint?: number;
  debounceMs?: number;
}

interface ResponsiveState {
  isMobile: boolean;
  width: number;
  height: number;
}

export const useResponsive = (config: ResponsiveConfig = {}) => {
  const { mobileBreakpoint = 768, debounceMs = 150 } = config;
  
  const [state, setState] = useState<ResponsiveState>(() => ({
    isMobile: typeof window !== 'undefined' ? window.innerWidth < mobileBreakpoint : false,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  const updateDimensions = useCallback(() => {
    setState({
      isMobile: window.innerWidth < mobileBreakpoint,
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, [mobileBreakpoint]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: number;

    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateDimensions, debounceMs);
    };

    window.addEventListener('resize', debouncedResize);
    
    // Initial call
    updateDimensions();
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [updateDimensions, debounceMs]);

  return state;
};
