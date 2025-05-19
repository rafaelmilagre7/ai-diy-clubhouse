
// Este arquivo está sendo mantido para compatibilidade
// Ele reexporta funcionalidades dos arquivos mais específicos

import { 
  validateRole, 
  validateUserRole,
  determineRoleFromEmail, 
  isSuperAdmin 
} from './profileUtils/roleValidation';

import {
  getUserProfile as fetchUserProfile,
  createUserProfile as createUserProfileIfNeeded
} from './profileUtils/userProfileFunctions';

export {
  validateRole,
  validateUserRole,
  determineRoleFromEmail,
  isSuperAdmin,
  fetchUserProfile,
  createUserProfileIfNeeded
};
