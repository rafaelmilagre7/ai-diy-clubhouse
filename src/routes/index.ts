
export { AuthRoutes } from './AuthRoutes';
export { MemberRoutes } from './MemberRoutes';
export { AdminRoutes } from './AdminRoutes';

// Centralized route configuration for easy importing
export const AppRoutes = {
  Auth: AuthRoutes,
  Member: MemberRoutes,
  Admin: AdminRoutes
};
