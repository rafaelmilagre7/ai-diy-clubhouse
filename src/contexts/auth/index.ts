
// Export all utility functions
export { fetchUserProfile } from './utils';
export { signOutUser } from './utils';
export { validateUserRole, isSuperAdmin } from './utils';

// Export auth components and hooks from the main index file
export { AuthProvider, useAuth, useIsAdmin } from './index.tsx';
export type { AuthContextType } from './types';
