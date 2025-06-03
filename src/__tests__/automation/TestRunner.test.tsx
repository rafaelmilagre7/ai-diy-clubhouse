
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockAuthProvider } from '../utils/mockProviders';
import { 
  setupHookMocks, 
  mockUseUnifiedOnboardingValidation, 
  clearHookMocks 
} from '../utils/mockHooks';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';

// Setup mocks
setupHookMocks();

// Import all components we need to test
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import AdminProtectedRoutes from '@/components/auth/AdminProtectedRoutes';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';

const mockedUseUnifiedOnboardingValidation = useUnifiedOnboardingValidation as jest.MockedFunction<typeof useUnifiedOnboardingValidation>;

describe('Automated Test Runner - Fase 1 (Updated)', () => {
  beforeEach(() => {
    clearHookMocks();
    // Set NODE_ENV to test for all tests
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restore NODE_ENV
    delete process.env.NODE_ENV;
  });

  describe('Integration Test Suite', () => {
    test('Complete authentication flow with all guards', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.complete);
      
      // Test complete flow: Auth + Admin + Feature Guard
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isAdmin={true}>
            <ProtectedRoute requireAdmin={true}>
              <AdminProtectedRoutes>
                <SmartFeatureGuard feature="networking">
                  <div>Complete Access Granted</div>
                </SmartFeatureGuard>
              </AdminProtectedRoutes>
            </ProtectedRoute>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Complete Access Granted')).toBeInTheDocument();
    });

    test('Blocked access at different levels', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.incomplete);
      
      // Test blocking at feature guard level
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isAdmin={false}>
            <ProtectedRoute>
              <SmartFeatureGuard feature="networking">
                <div>Should Not See This</div>
              </SmartFeatureGuard>
            </ProtectedRoute>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.queryByText('Should Not See This')).not.toBeInTheDocument();
      expect(screen.getByText(/Networking Inteligente.*Bloqueada/)).toBeInTheDocument();
    });

    test('Performance test - reduced timeouts in test environment', async () => {
      const start = Date.now();
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isLoading={true}>
            <ProtectedRoute>
              <SmartFeatureGuard feature="networking">
                <div>Performance Test Content</div>
              </SmartFeatureGuard>
            </ProtectedRoute>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      const end = Date.now();
      const renderTime = end - start;
      
      // Should render quickly in test environment
      expect(renderTime).toBeLessThan(100); // 100ms max
      expect(screen.getByText('Verificando autenticação...')).toBeInTheDocument();
    });
  });

  describe('Error Recovery Tests', () => {
    test('Should recover from hook errors gracefully', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.error);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <ProtectedRoute>
              <SmartFeatureGuard feature="networking">
                <div>Error Recovery Test</div>
              </SmartFeatureGuard>
            </ProtectedRoute>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      // Should not crash and show some fallback
      expect(screen.getByText(/Complete seu onboarding/)).toBeInTheDocument();
    });
  });

  describe('Unified Guard System Validation', () => {
    test('Should only use SmartFeatureGuard (no conflicts)', () => {
      // Verify that old guards are not imported
      expect(() => {
        require('@/components/auth/FeatureGuard');
      }).toThrow();
      
      expect(() => {
        require('@/components/auth/FeatureAccessGuard');
      }).toThrow();
    });

    test('SmartFeatureGuard handles all feature protection scenarios', () => {
      const features = ['networking', 'implementation_trail', 'unknown_feature'];
      
      features.forEach(feature => {
        mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.complete);
        
        const { unmount } = render(
          <BrowserRouter>
            <MockAuthProvider authenticated={true}>
              <SmartFeatureGuard feature={feature}>
                <div>{feature} Content</div>
              </SmartFeatureGuard>
            </MockAuthProvider>
          </BrowserRouter>
        );
        
        expect(screen.getByText(`${feature} Content`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Mock Validation', () => {
    test('All critical hooks are properly mocked', () => {
      // Verify mocks are working
      expect(useUnifiedOnboardingValidation).toBeDefined();
      expect(jest.isMockFunction(useUnifiedOnboardingValidation)).toBe(true);
    });

    test('Mock states are consistent and realistic', () => {
      const states = [
        mockUseUnifiedOnboardingValidation.complete,
        mockUseUnifiedOnboardingValidation.incomplete,
        mockUseUnifiedOnboardingValidation.loading,
        mockUseUnifiedOnboardingValidation.error
      ];
      
      states.forEach(state => {
        expect(state).toHaveProperty('isOnboardingComplete');
        expect(state).toHaveProperty('isLoading');
        expect(typeof state.isOnboardingComplete).toBe('boolean');
        expect(typeof state.isLoading).toBe('boolean');
      });
    });
  });
});
