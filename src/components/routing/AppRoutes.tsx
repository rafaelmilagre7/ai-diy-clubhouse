
import { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { AdminRoutes } from "./AdminRoutes";
import { MemberRoutes } from "./MemberRoutes";
import AuthProtectedRoutes from "@/components/auth/AuthProtectedRoutes";
import AdminProtectedRoutes from "@/components/auth/AdminProtectedRoutes";
import LoadingScreen from "@/components/common/LoadingScreen";

/**
 * AppRoutes is responsible for setting up the main routing structure
 * It includes admin and member routes behind authentication checks
 */
const AppRoutes = ({ children }: { children: ReactNode }) => {
  return (
    <Routes>
      {/* Admin routes - protected by admin role check */}
      <Route 
        path="/admin/*" 
        element={
          <AdminProtectedRoutes>
            <AdminRoutes />
          </AdminProtectedRoutes>
        } 
      />

      {/* Member routes - protected by basic auth check */}
      <Route 
        path="*" 
        element={
          <AuthProtectedRoutes>
            <MemberRoutes />
          </AuthProtectedRoutes>
        } 
      />
      
      {children}
    </Routes>
  );
};

export default AppRoutes;
