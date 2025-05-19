
// Re-exportação dos utilitários de perfil para manter compatibilidade
export * from './profileUtils/stringGenerator';

// Exportação das funções de validação de perfil
export {
  validateUserRole,
  determineRoleFromEmail,
  isSuperAdmin
} from './profileUtils/roleValidation';

// Exportação das funções de gerenciamento de perfil
export {
  fetchUserProfile,
  updateUserProfile
} from './profileUtils/userProfileFunctions';
