
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockAuthProvider } from '../utils/mockProviders';
import { setupHookMocks, mockUseUnifiedOnboardingValidation, clearHookMocks } from '../utils/mockHooks';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';

// Setup mocks
setupHookMocks();

// Components to test (only SmartFeatureGuard now)
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';

const mockedUseUnifiedOnboardingValidation = useUnifiedOnboardingValidation as jest.MockedFunction<typeof useUnifiedOnboardingValidation>;

describe('Feature Guard Validator - Fase 1 (Unified)', () => {
  beforeEach(() => {
    clearHookMocks();
    mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.complete);
  });

  describe('SmartFeatureGuard - Networking Feature', () => {
    test('Should allow access with completed onboarding', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.complete);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <SmartFeatureGuard feature="networking">
              <div>Networking Available</div>
            </SmartFeatureGuard>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Networking Available')).toBeInTheDocument();
    });

    test('Should block access without completed onboarding', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.incomplete);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <SmartFeatureGuard feature="networking">
              <div>Networking Content</div>
            </SmartFeatureGuard>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText(/Networking Inteligente.*Bloqueada/)).toBeInTheDocument();
      expect(screen.getByText(/Complete seu onboarding/)).toBeInTheDocument();
    });

    test('Should allow admin access regardless of onboarding', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.incomplete);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isAdmin={true}>
            <SmartFeatureGuard feature="networking">
              <div>Admin Networking Access</div>
            </SmartFeatureGuard>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Admin Networking Access')).toBeInTheDocument();
    });
  });

  describe('SmartFeatureGuard - Implementation Trail Feature', () => {
    test('Should handle implementation trail feature correctly', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.complete);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <SmartFeatureGuard feature="implementation_trail">
              <div>Implementation Trail Content</div>
            </SmartFeatureGuard>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Implementation Trail Content')).toBeInTheDocument();
    });

    test('Should block implementation trail without onboarding', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.incomplete);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <SmartFeatureGuard feature="implementation_trail">
              <div>Trail Content</div>
            </SmartFeatureGuard>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText(/Trilha de Implementação.*Bloqueada/)).toBeInTheDocument();
    });
  });

  describe('Loading States with Optimized Timeouts', () => {
    test('Should show loading state efficiently', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.loading);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <SmartFeatureGuard feature="networking">
              <div>Content</div>
            </SmartFeatureGuard>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Verificando acesso...')).toBeInTheDocument();
    });
  });

  describe('Fallback Functionality', () => {
    test('Should render custom fallback when provided', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.incomplete);
      
      const customFallback = <div>Custom Fallback Message</div>;
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <SmartFeatureGuard feature="networking" fallback={customFallback}>
              <div>Protected Content</div>
            </SmartFeatureGuard>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Custom Fallback Message')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Unknown Features', () => {
    test('Should handle unknown features gracefully', () => {
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <SmartFeatureGuard feature="unknown_feature">
              <div>Unknown Feature Content</div>
            </SmartFeatureGuard>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      // Should allow access to unknown features (no specific config)
      expect(screen.getByText('Unknown Feature Content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('Should handle onboarding validation errors', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.error);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <SmartFeatureGuard feature="networking">
              <div>Error Handling Content</div>
            </SmartFeatureGuard>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      // Should not crash and should show some content
      expect(screen.getByText(/Complete seu onboarding/)).toBeInTheDocument();
    });
  });
});
