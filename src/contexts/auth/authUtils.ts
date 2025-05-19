
// Re-export all utils from the utils directory
export {
  fetchUserProfile,
  createTestUser,
  signInAsTestMember,
  signInAsTestAdmin,
  signOutUser
} from './utils';

// Exportando funções adicionais que podem ser necessárias
export { signInWithGoogle } from './utils/googleAuth';
