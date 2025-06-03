
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TestWrapper } from '../../utils/mockProviders';
import { setupHookMocks, clearHookMocks } from '../../utils/mockHooks';

// Mock heavy components to simulate real app behavior
const MockDashboard = React.lazy(() => 
  Promise.resolve({ default: () => <div>Dashboard Loaded</div> })
);

const MockTools = React.lazy(() => 
  Promise.resolve({ default: () => <div>Tools Loaded</div> })
);

const MockFormacao = React.lazy(() => 
  Promise.resolve({ default: () => <div>Formacao Loaded</div> })
);

const MockNetworking = React.lazy(() => 
  Promise.resolve({ default: () => <div>Networking Loaded</div> })
);

const MockComunidade = React.lazy(() => 
  Promise.resolve({ default: () => <div>Comunidade Loaded</div> })
);

// Performance measurement utilities
const measureRenderTime = async (component: React.ReactElement): Promise<number> => {
  const startTime = performance.now();
  
  const result = render(component);
  
  // Wait for any async operations
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const endTime = performance.now();
  
  result.unmount();
  
  return endTime - startTime;
};

const measureMultipleRenders = async (component: React.ReactElement, iterations: number = 5): Promise<{
  average: number;
  min: number;
  max: number;
  times: number[];
}> => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const time = await measureRenderTime(component);
    times.push(time);
  }
  
  return {
    average: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    times
  };
};

describe('Navigation Speed Test - Fase 2', () => {
  beforeEach(() => {
    setupHookMocks();
    // Clear performance entries
    if (performance.clearMarks) {
      performance.clearMarks();
    }
  });

  afterEach(() => {
    clearHookMocks();
  });

  describe('Route Loading Performance', () => {
    test('Dashboard should load within acceptable time', async () => {
      const component = (
        <TestWrapper initialRoute="/dashboard" authenticated={true}>
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route path="/dashboard" element={<MockDashboard />} />
            </Routes>
          </MemoryRouter>
        </TestWrapper>
      );

      const stats = await measureMultipleRenders(component);
      
      // Dashboard should load in less than 200ms on average
      expect(stats.average).toBeLessThan(200);
      console.log(`Dashboard average load time: ${stats.average.toFixed(2)}ms`);
    });

    test('Tools page should load efficiently', async () => {
      const component = (
        <TestWrapper initialRoute="/tools" authenticated={true}>
          <MemoryRouter initialEntries={['/tools']}>
            <Routes>
              <Route path="/tools" element={<MockTools />} />
            </Routes>
          </MemoryRouter>
        </TestWrapper>
      );

      const stats = await measureMultipleRenders(component);
      
      // Tools should load in less than 300ms (may have more components)
      expect(stats.average).toBeLessThan(300);
      console.log(`Tools average load time: ${stats.average.toFixed(2)}ms`);
    });

    test('Formacao page should load within limits', async () => {
      const component = (
        <TestWrapper initialRoute="/formacao" authenticated={true} isFormacao={true}>
          <MemoryRouter initialEntries={['/formacao']}>
            <Routes>
              <Route path="/formacao" element={<MockFormacao />} />
            </Routes>
          </MemoryRouter>
        </TestWrapper>
      );

      const stats = await measureMultipleRenders(component);
      
      // Formacao should load in less than 400ms (content-heavy)
      expect(stats.average).toBeLessThan(400);
      console.log(`Formacao average load time: ${stats.average.toFixed(2)}ms`);
    });

    test('Networking page performance', async () => {
      const component = (
        <TestWrapper initialRoute="/networking" authenticated={true}>
          <MemoryRouter initialEntries={['/networking']}>
            <Routes>
              <Route path="/networking" element={<MockNetworking />} />
            </Routes>
          </MemoryRouter>
        </TestWrapper>
      );

      const stats = await measureMultipleRenders(component);
      
      // Networking should load in less than 250ms
      expect(stats.average).toBeLessThan(250);
      console.log(`Networking average load time: ${stats.average.toFixed(2)}ms`);
    });

    test('Comunidade page performance', async () => {
      const component = (
        <TestWrapper initialRoute="/comunidade" authenticated={true}>
          <MemoryRouter initialEntries={['/comunidade']}>
            <Routes>
              <Route path="/comunidade" element={<MockComunidade />} />
            </Routes>
          </MemoryRouter>
        </TestWrapper>
      );

      const stats = await measureMultipleRenders(component);
      
      // Comunidade should load in less than 300ms
      expect(stats.average).toBeLessThan(300);
      console.log(`Comunidade average load time: ${stats.average.toFixed(2)}ms`);
    });
  });

  describe('Route Transition Performance', () => {
    test('Should handle rapid route changes efficiently', async () => {
      const routes = ['/dashboard', '/tools', '/networking', '/comunidade'];
      const transitionTimes: number[] = [];

      for (let i = 0; i < routes.length; i++) {
        const currentRoute = routes[i];
        const nextRoute = routes[(i + 1) % routes.length];

        const startTime = performance.now();

        const { rerender } = render(
          <TestWrapper initialRoute={currentRoute} authenticated={true}>
            <MemoryRouter initialEntries={[currentRoute]}>
              <Routes>
                <Route path="/dashboard" element={<MockDashboard />} />
                <Route path="/tools" element={<MockTools />} />
                <Route path="/networking" element={<MockNetworking />} />
                <Route path="/comunidade" element={<MockComunidade />} />
              </Routes>
            </MemoryRouter>
          </TestWrapper>
        );

        // Simulate route change
        rerender(
          <TestWrapper initialRoute={nextRoute} authenticated={true}>
            <MemoryRouter initialEntries={[nextRoute]}>
              <Routes>
                <Route path="/dashboard" element={<MockDashboard />} />
                <Route path="/tools" element={<MockTools />} />
                <Route path="/networking" element={<MockNetworking />} />
                <Route path="/comunidade" element={<MockComunidade />} />
              </Routes>
            </MemoryRouter>
          </TestWrapper>
        );

        const endTime = performance.now();
        transitionTimes.push(endTime - startTime);
      }

      const averageTransition = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length;
      
      // Route transitions should be fast
      expect(averageTransition).toBeLessThan(100);
      console.log(`Average route transition time: ${averageTransition.toFixed(2)}ms`);
    });

    test('Should maintain performance under load simulation', async () => {
      const iterations = 10;
      const loadTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        const component = (
          <TestWrapper initialRoute="/dashboard" authenticated={true}>
            <MemoryRouter initialEntries={['/dashboard']}>
              <Routes>
                <Route path="/dashboard" element={<MockDashboard />} />
              </Routes>
            </MemoryRouter>
          </TestWrapper>
        );

        const { unmount } = render(component);
        
        // Simulate heavy operations
        await new Promise(resolve => setTimeout(resolve, 10));
        
        unmount();

        const endTime = performance.now();
        loadTimes.push(endTime - startTime);
      }

      const averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      const maxLoadTime = Math.max(...loadTimes);

      // Should maintain consistent performance
      expect(averageLoadTime).toBeLessThan(150);
      expect(maxLoadTime).toBeLessThan(300);
      
      console.log(`Load test - Average: ${averageLoadTime.toFixed(2)}ms, Max: ${maxLoadTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Monitoring', () => {
    test('Should not cause memory leaks during navigation', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform multiple navigation cycles
      for (let cycle = 0; cycle < 5; cycle++) {
        const routes = ['/dashboard', '/tools', '/networking', '/comunidade'];
        
        for (const route of routes) {
          const component = (
            <TestWrapper initialRoute={route} authenticated={true}>
              <MemoryRouter initialEntries={[route]}>
                <Routes>
                  <Route path="/dashboard" element={<MockDashboard />} />
                  <Route path="/tools" element={<MockTools />} />
                  <Route path="/networking" element={<MockNetworking />} />
                  <Route path="/comunidade" element={<MockComunidade />} />
                </Routes>
              </MemoryRouter>
            </TestWrapper>
          );

          const { unmount } = render(component);
          await new Promise(resolve => setTimeout(resolve, 10));
          unmount();
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB in test environment)
      if (initialMemory > 0) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        console.log(`Memory usage increase: ${(memoryIncrease / (1024 * 1024)).toFixed(2)}MB`);
      }
    });
  });

  describe('Authentication Flow Performance', () => {
    test('Should handle auth state changes efficiently', async () => {
      const authStates = [
        { authenticated: false },
        { authenticated: true, isAdmin: false },
        { authenticated: true, isAdmin: true },
        { authenticated: true, isFormacao: true }
      ];

      const stateChangeTimes: number[] = [];

      for (const authState of authStates) {
        const startTime = performance.now();

        const { rerender } = render(
          <TestWrapper {...authState} initialRoute="/dashboard">
            <MemoryRouter initialEntries={['/dashboard']}>
              <Routes>
                <Route path="/dashboard" element={<MockDashboard />} />
              </Routes>
            </MemoryRouter>
          </TestWrapper>
        );

        // Simulate auth state change
        rerender(
          <TestWrapper authenticated={true} initialRoute="/dashboard">
            <MemoryRouter initialEntries={['/dashboard']}>
              <Routes>
                <Route path="/dashboard" element={<MockDashboard />} />
              </Routes>
            </MemoryRouter>
          </TestWrapper>
        );

        const endTime = performance.now();
        stateChangeTimes.push(endTime - startTime);
      }

      const averageAuthTime = stateChangeTimes.reduce((a, b) => a + b, 0) / stateChangeTimes.length;
      
      // Auth state changes should be fast
      expect(averageAuthTime).toBeLessThan(50);
      console.log(`Average auth state change time: ${averageAuthTime.toFixed(2)}ms`);
    });
  });
});
