
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockAuthProvider } from '../utils/mockProviders';
import { setupHookMocks, mockUseUnifiedOnboardingValidation, clearHookMocks } from '../utils/mockHooks';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';

// Setup mocks
setupHookMocks();

// Components to test
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import AdminProtectedRoutes from '@/components/auth/AdminProtectedRoutes';

const mockedUseUnifiedOnboardingValidation = useUnifiedOnboardingValidation as jest.MockedFunction<typeof useUnifiedOnboardingValidation>;

describe('Auth Flow Tester - Fase 1', () => {
  beforeEach(() => {
    clearHookMocks();
    mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.complete);
  });

  describe('Authentication States', () => {
    test('Should handle unauthenticated state', () => {
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={false}>
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      // Should not show protected content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    test('Should handle authenticated member state', () => {
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isAdmin={false}>
            <ProtectedRoute>
              <div>Member Content</div>
            </ProtectedRoute>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Member Content')).toBeInTheDocument();
    });

    test('Should handle authenticated admin state', () => {
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isAdmin={true}>
            <AdminProtectedRoutes>
              <div>Admin Content</div>
            </AdminProtectedRoutes>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  describe('Role-based Access', () => {
    test('Should block non-admin from admin routes', () => {
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isAdmin={false}>
            <AdminProtectedRoutes>
              <div>Admin Only Content</div>
            </AdminProtectedRoutes>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
    });

    test('Should allow admin access to admin routes', () => {
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isAdmin={true}>
            <AdminProtectedRoutes>
              <div>Admin Panel</div>
            </AdminProtectedRoutes>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });
  });

  describe('Loading States with Reduced Timeouts', () => {
    test('Should handle loading state efficiently in test environment', async () => {
      // Set NODE_ENV to test to trigger reduced timeouts
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isLoading={true}>
            <ProtectedRoute>
              <div>Content</div>
            </ProtectedRoute>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Verificando autenticação...')).toBeInTheDocument();
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Onboarding Requirements', () => {
    test('Should block access when onboarding is required but incomplete', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.incomplete);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <ProtectedRoute requireOnboarding={true}>
              <div>Onboarding Required Content</div>
            </ProtectedRoute>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.queryByText('Onboarding Required Content')).not.toBeInTheDocument();
    });

    test('Should allow access when onboarding is complete', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.complete);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <ProtectedRoute requireOnboarding={true}>
              <div>Onboarding Complete Content</div>
            </ProtectedRoute>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Onboarding Complete Content')).toBeInTheDocument();
    });

    test('Should bypass onboarding requirement for admins', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.incomplete);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isAdmin={true}>
            <ProtectedRoute requireOnboarding={true}>
              <div>Admin Bypass Content</div>
            </ProtectedRoute>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Admin Bypass Content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('Should handle onboarding validation errors gracefully', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.error);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <ProtectedRoute requireOnboarding={true}>
              <div>Error Test Content</div>
            </ProtectedRoute>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      // Should still allow access even with validation error
      expect(screen.getByText('Error Test Content')).toBeInTheDocument();
    });
  });
});
