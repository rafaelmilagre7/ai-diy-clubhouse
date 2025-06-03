
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MockAuthProvider } from '../utils/mockProviders';
import { setupHookMocks, mockUseUnifiedOnboardingValidation, clearHookMocks } from '../utils/mockHooks';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';

// Setup mocks
setupHookMocks();

// Components to test
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';

const mockedUseUnifiedOnboardingValidation = useUnifiedOnboardingValidation as jest.MockedFunction<typeof useUnifiedOnboardingValidation>;

describe('Route Validator - Fase 1', () => {
  beforeEach(() => {
    clearHookMocks();
    mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.complete);
  });

  describe('Public Routes', () => {
    test('Login page should render for unauthenticated users', () => {
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={false}>
            <Routes>
              <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    test('Dashboard should redirect to login when not authenticated', () => {
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={false}>
            <Routes>
              <Route path="/login" element={<div>Login Page</div>} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <div>Dashboard</div>
                </ProtectedRoute>
              } />
            </Routes>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      // Should redirect to login
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    test('Dashboard should render when authenticated', () => {
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <Routes>
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <div>Dashboard Content</div>
                </ProtectedRoute>
              } />
            </Routes>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });
  });

  describe('Admin Routes', () => {
    test('Admin routes should be accessible to admin users', () => {
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isAdmin={true}>
            <Routes>
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <div>Admin Panel</div>
                </ProtectedRoute>
              } />
            </Routes>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    test('Admin routes should redirect non-admin users', () => {
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true} isAdmin={false}>
            <Routes>
              <Route path="/dashboard" element={<div>Dashboard</div>} />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <div>Admin Panel</div>
                </ProtectedRoute>
              } />
            </Routes>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      // Should redirect to dashboard
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Feature Guard Routes', () => {
    test('Networking should block without onboarding', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.incomplete);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <Routes>
              <Route path="/networking" element={
                <SmartFeatureGuard feature="networking">
                  <div>Networking Content</div>
                </SmartFeatureGuard>
              } />
            </Routes>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText(/Networking Inteligente.*Bloqueada/)).toBeInTheDocument();
    });

    test('Networking should allow access with completed onboarding', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.complete);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <Routes>
              <Route path="/networking" element={
                <SmartFeatureGuard feature="networking">
                  <div>Networking Content</div>
                </SmartFeatureGuard>
              } />
            </Routes>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Networking Content')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('Should show loading state with reduced timeout in test environment', () => {
      mockedUseUnifiedOnboardingValidation.mockReturnValue(mockUseUnifiedOnboardingValidation.loading);
      
      render(
        <BrowserRouter>
          <MockAuthProvider authenticated={true}>
            <Routes>
              <Route path="/networking" element={
                <SmartFeatureGuard feature="networking">
                  <div>Networking Content</div>
                </SmartFeatureGuard>
              } />
            </Routes>
          </MockAuthProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Verificando acesso...')).toBeInTheDocument();
    });
  });
});
