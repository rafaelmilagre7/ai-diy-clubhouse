

// Export all utility functions
export { fetchUserProfile } from './utils';
// Removido: export { signOutUser } from './utils';
export { validateUserRole, isSuperAdmin } from './utils';

// Export auth components and hooks from the main auth file
export { AuthProvider, useAuth } from './index.tsx';

// Export types
export type { AuthContextType } from './types';

