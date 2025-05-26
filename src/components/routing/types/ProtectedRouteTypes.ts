
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;        // Padrão: true
  requireAdmin?: boolean;       // Padrão: false  
  requireFormacao?: boolean;    // Padrão: false
  allowedRoles?: string[];      // Array de roles permitidos
  fallbackRoute?: string;       // Padrão: "/login"
  timeoutMs?: number;          // Padrão: 3000
  showTransitions?: boolean;    // Padrão: false
}

export interface RouteAccessConfig {
  isAuthenticated: boolean;
  hasRequiredRole: boolean;
  shouldRedirect: boolean;
  redirectTarget: string;
}
