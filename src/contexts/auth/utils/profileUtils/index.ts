
// Re-exportar funções de validação de perfil
import { 
  validateRole, 
  validateUserRole, 
  determineRoleFromEmail, 
  isSuperAdmin 
} from './roleValidation';

// Exportar todas as funções necessárias
export {
  validateRole,
  validateUserRole,
  determineRoleFromEmail,
  isSuperAdmin
};

// Também exportamos outras funções relacionadas a perfis
export * from './userProfileFunctions';
