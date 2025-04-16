
import { Navigate } from "react-router-dom";
import { useLayoutAuthentication } from "@/hooks/auth/useLayoutAuthentication";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";

/**
 * LayoutProvider handles authentication checks and role-based routing
 * before rendering the appropriate layout component
 */
const LayoutProvider = () => {
  const {
    user,
    profile,
    isAdmin,
    isLoading,
    loadingTimeout,
    redirectChecked
  } = useLayoutAuthentication();

  // Fast path for members - If we have user and profile, render immediately
  if (user && profile && !isAdmin) {
    return <MemberLayout />;
  }

  // Show loading screen while checking the session (but only if timeout not exceeded)
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Preparando seu dashboard..." />;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is admin, redirect to admin layout
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Default case: Render the member layout
  return <MemberLayout />;
};

export default LayoutProvider;
