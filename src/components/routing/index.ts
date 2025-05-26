
// Exportar todos os componentes de roteamento unificados
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as AuthenticatedRoute } from './AuthenticatedRoute';
export { default as AdminRoute } from './AdminRoute';
export { default as FormacaoRoute } from './FormacaoRoute';

// Exportar tipos
export type { ProtectedRouteProps, RouteAccessConfig } from './types/ProtectedRouteTypes';

// Legacy - manter para compatibilidade
export { ProtectedRoutes } from '../../auth/ProtectedRoutes';
