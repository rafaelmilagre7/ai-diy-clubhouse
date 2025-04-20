
import { AuthRoutes } from './AuthRoutes';
import { MemberRoutes } from './MemberRoutes';
import { AdminRoutes } from './AdminRoutes';

export { AuthRoutes, MemberRoutes, AdminRoutes };

// Centralized route configuration for easy importing
export const AppRoutes = {
  Auth: () => AuthRoutes(),
  Member: () => MemberRoutes(),
  Admin: () => AdminRoutes()
};
