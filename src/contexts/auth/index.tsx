
// Exportar apenas a implementação unificada
export { AuthProvider, useAuth } from './AuthProvider';
export type { AuthContextType, Profile } from './AuthProvider';

// Constantes de teste
export const TEST_ADMIN = {
  email: 'rafael@viverdeia.ai',
  role: 'admin'
};

export const TEST_MEMBER = {
  email: 'membro@teste.com',
  role: 'member'
};
