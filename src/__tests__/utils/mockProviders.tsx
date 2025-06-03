
import React, { createContext, useContext, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

// Mock Auth Context
interface MockAuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  authError: Error | null;
  signIn: jest.Mock;
  signOut: jest.Mock;
  signInAsMember: jest.Mock;
  signInAsAdmin: jest.Mock;
  setSession: jest.Mock;
  setUser: jest.Mock;
  setProfile: jest.Mock;
  setIsLoading: jest.Mock;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

interface MockAuthProviderProps {
  children: ReactNode;
  authenticated?: boolean;
  isAdmin?: boolean;
  isFormacao?: boolean;
  isLoading?: boolean;
  user?: Partial<User>;
  profile?: Partial<UserProfile>;
}

export const MockAuthProvider = ({ 
  children, 
  authenticated = true,
  isAdmin = false,
  isFormacao = false,
  isLoading = false,
  user = {},
  profile = {}
}: MockAuthProviderProps) => {
  const mockUser = authenticated ? {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
    ...user
  } as User : null;

  const mockProfile = authenticated ? {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: isAdmin ? 'admin' : isFormacao ? 'formacao' : 'member',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...profile
  } as UserProfile : null;

  const mockSession = authenticated ? {
    access_token: 'mock-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    refresh_token: 'mock-refresh-token',
    user: mockUser
  } as Session : null;

  const contextValue: MockAuthContextType = {
    session: mockSession,
    user: mockUser,
    profile: mockProfile,
    isAdmin,
    isFormacao,
    isLoading,
    authError: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signInAsMember: jest.fn(),
    signInAsAdmin: jest.fn(),
    setSession: jest.fn(),
    setUser: jest.fn(),
    setProfile: jest.fn(),
    setIsLoading: jest.fn(),
  };

  return (
    <MockAuthContext.Provider value={contextValue}>
      {children}
    </MockAuthContext.Provider>
  );
};

// Mock useAuth hook
export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

// Mock Feature Provider (if needed)
interface MockFeatureProviderProps {
  children: ReactNode;
  features?: Record<string, boolean>;
}

export const MockFeatureProvider = ({ children, features = {} }: MockFeatureProviderProps) => {
  return <>{children}</>;
};

// Test Wrapper Component
interface TestWrapperProps {
  children: ReactNode;
  authenticated?: boolean;
  isAdmin?: boolean;
  isFormacao?: boolean;
  isLoading?: boolean;
  user?: Partial<User>;
  profile?: Partial<UserProfile>;
  initialRoute?: string;
  features?: Record<string, boolean>;
}

export const TestWrapper = ({ 
  children, 
  authenticated = true,
  isAdmin = false,
  isFormacao = false,
  isLoading = false,
  user = {},
  profile = {},
  initialRoute = '/',
  features = {}
}: TestWrapperProps) => {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <MockAuthProvider
        authenticated={authenticated}
        isAdmin={isAdmin}
        isFormacao={isFormacao}
        isLoading={isLoading}
        user={user}
        profile={profile}
      >
        <MockFeatureProvider features={features}>
          {children}
        </MockFeatureProvider>
      </MockAuthProvider>
    </MemoryRouter>
  );
};

// Default export for convenience
export default TestWrapper;
