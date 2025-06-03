
// Mocks para hooks problemáticos identificados na Fase 1

export const mockUseUnifiedOnboardingValidation = {
  complete: {
    isOnboardingComplete: true,
    hasValidData: true,
    isLoading: false,
    error: null,
    source: 'quick_onboarding',
    onboardingData: {
      is_completed: true,
      current_step: 'completed'
    },
    checkOnboardingStatus: jest.fn()
  },
  incomplete: {
    isOnboardingComplete: false,
    hasValidData: true,
    isLoading: false,
    error: null,
    source: 'quick_onboarding',
    onboardingData: {
      is_completed: false,
      current_step: 'step_1'
    },
    checkOnboardingStatus: jest.fn()
  },
  loading: {
    isOnboardingComplete: false,
    hasValidData: false,
    isLoading: true,
    error: null,
    source: 'none',
    onboardingData: null,
    checkOnboardingStatus: jest.fn()
  },
  error: {
    isOnboardingComplete: false,
    hasValidData: false,
    isLoading: false,
    error: new Error('Test error'),
    source: 'error',
    onboardingData: null,
    checkOnboardingStatus: jest.fn()
  }
};

export const mockUseSmartFeatureAccess = {
  hasAccess: {
    hasAccess: true,
    hasRoleAccess: true,
    onboardingComplete: true,
    userRole: 'member',
    blockReason: 'none' as const,
    blockMessage: '',
    isLoading: false,
    error: null,
    refetch: jest.fn()
  },
  noAccess: {
    hasAccess: false,
    hasRoleAccess: false,
    onboardingComplete: false,
    userRole: 'member',
    blockReason: 'incomplete_onboarding' as const,
    blockMessage: 'Complete seu onboarding para acessar esta funcionalidade.',
    isLoading: false,
    error: null,
    refetch: jest.fn()
  },
  loading: {
    hasAccess: false,
    hasRoleAccess: false,
    onboardingComplete: false,
    userRole: null,
    blockReason: 'insufficient_role' as const,
    blockMessage: '',
    isLoading: true,
    error: null,
    refetch: jest.fn()
  }
};

export const mockUseOptimizedNetworkingAccess = {
  hasAccess: {
    hasAccess: true,
    isLoading: false,
    isAdmin: false,
    needsOnboarding: false,
    accessMessage: null
  },
  noAccess: {
    hasAccess: false,
    isLoading: false,
    isAdmin: false,
    needsOnboarding: true,
    accessMessage: 'Complete o onboarding para acessar o Networking'
  },
  adminAccess: {
    hasAccess: true,
    isLoading: false,
    isAdmin: true,
    needsOnboarding: false,
    accessMessage: null
  },
  loading: {
    hasAccess: false,
    isLoading: true,
    isAdmin: false,
    needsOnboarding: false,
    accessMessage: null
  }
};

export const mockUseNetworkingAccess = {
  hasAccess: {
    hasAccess: true,
    accessMessage: '',
    isAdmin: false,
    hasNetworkingPermission: true,
    isOnboardingComplete: true,
    isLoading: false,
    needsOnboarding: false,
    reason: null
  },
  noAccess: {
    hasAccess: false,
    accessMessage: 'Complete o onboarding para acessar o Networking Inteligente',
    isAdmin: false,
    hasNetworkingPermission: false,
    isOnboardingComplete: false,
    isLoading: false,
    needsOnboarding: true,
    reason: 'Complete o onboarding para acessar o networking'
  }
};

// Função helper para aplicar mocks
export const setupHookMocks = () => {
  // Mock useUnifiedOnboardingValidation
  jest.mock('@/hooks/onboarding/useUnifiedOnboardingValidation', () => ({
    useUnifiedOnboardingValidation: jest.fn()
  }));

  // Mock useSmartFeatureAccess
  jest.mock('@/hooks/auth/useSmartFeatureAccess', () => ({
    useSmartFeatureAccess: jest.fn()
  }));

  // Mock useOptimizedNetworkingAccess
  jest.mock('@/hooks/networking/useOptimizedNetworkingAccess', () => ({
    useOptimizedNetworkingAccess: jest.fn()
  }));

  // Mock useNetworkingAccess
  jest.mock('@/hooks/networking/useNetworkingAccess', () => ({
    useNetworkingAccess: jest.fn()
  }));
};

// Função para limpar mocks
export const clearHookMocks = () => {
  jest.clearAllMocks();
};
