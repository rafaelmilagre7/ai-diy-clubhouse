
// Export all utility functions
export { fetchUserProfile, createUserProfileIfNeeded, processUserProfile } from './profileOperations';
export { 
  createTestUser, 
  signInAsTestMember, 
  signInAsTestAdmin 
} from './testAuth';
export { signOutUser } from './sessionUtils';
export { determineRoleFromEmail, validateUserRole, isSuperAdmin } from './roleValidation';
