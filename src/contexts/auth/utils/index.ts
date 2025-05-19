
// Importações necessárias
import { 
  validateRole,
  validateUserRole,
  determineRoleFromEmail,
  isSuperAdmin 
} from './profileUtils/roleValidation';

// Exportações
export {
  validateRole,
  validateUserRole,
  determineRoleFromEmail,
  isSuperAdmin
};

// Outras exportações
export * from './profileUtils';
export * from './testAuth/createTestUser';
