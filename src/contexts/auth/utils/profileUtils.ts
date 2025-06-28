
// This file is maintained for backward compatibility
// It re-exports profile utility functions from the new structure

export { 
  fetchUserProfile,
  createUserProfileIfNeeded,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile
} from './profileUtils/userProfileFunctions';

export { 
  validateUserRole,
  isSuperAdmin
} from './profileUtils/roleValidation';
