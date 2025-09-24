import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { jest } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do react-router-dom
export const mockNavigate = jest.fn();
export const mockUseParams = jest.fn().mockReturnValue({});

// Mock do useToast
export const mockToast = jest.fn();
export const mockUseToast = () => ({ toast: mockToast });

// Mock dos hooks de automação
export const mockUseAutomationRules = jest.fn().mockReturnValue({
  data: [],
  isLoading: false,
  refetch: jest.fn()
});

export const mockUseAutomationRule = jest.fn().mockReturnValue({
  data: null,
  isLoading: false
});

export const mockUseAutomationLogStats = jest.fn().mockReturnValue({
  data: { total: 0, success: 0, failed: 0, pending: 0 }
});

// Provider personalizado para testes
interface TestProviderProps {
  children: React.ReactNode;
}

const TestProvider: React.FC<TestProviderProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Função customizada de render
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestProvider, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Utilitários para testes
export const waitForLoadingToFinish = async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
};

export const createMockEvent = (value?: any) => ({
  target: { value },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
});

export const createMockMouseEvent = () => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  currentTarget: {},
  target: {}
});

// Mock do window.confirm
export const mockWindowConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockWindowConfirm
});

// Reset de todos os mocks
export const resetAllMocks = () => {
  mockNavigate.mockClear();
  mockUseParams.mockClear();
  mockToast.mockClear();
  mockUseAutomationRules.mockClear();
  mockUseAutomationRule.mockClear();
  mockUseAutomationLogStats.mockClear();
  mockWindowConfirm.mockClear();
};