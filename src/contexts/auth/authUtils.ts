
// Re-export all utils from the utils directory
export {
  fetchUserProfile,
  // signOutUser removido pois função não existe mais
  validateUserRole,
  isSuperAdmin
} from './utils';

// Funcionalidade de login com Google removida para produção
export { signInWithGoogle } from './utils/googleAuth';

