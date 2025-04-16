
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import AuthSession from "@/components/auth/AuthSession";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import RootRedirect from "./RootRedirect";

// Member routes
import Auth from "@/pages/Auth";
import MemberDashboard from "@/pages/member/Dashboard";
import SolutionDetails from "@/pages/member/SolutionDetails";
import SolutionImplementation from "@/pages/member/SolutionImplementation";
import Profile from "@/pages/member/Profile";

// Admin routes
import AdminDashboard from "@/pages/admin/Dashboard";
import SolutionsList from "@/pages/admin/SolutionsList";
import SolutionEditor from "@/pages/admin/SolutionEditor";
import SolutionMetrics from "@/pages/admin/SolutionMetrics";
import UserManagement from "@/pages/admin/UserManagement";
import Index from "@/pages/Index";

const AppRoutes = () => {
  return (
    <AuthSession>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/index" element={<Index />} />
        <Route path="/" element={<RootRedirect />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="solution/:id" element={<SolutionDetails />} />
          <Route path="implement/:id/:moduleIndex" element={<SolutionImplementation />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="solutions" element={<SolutionsList />} />
          <Route path="solutions/new" element={<SolutionEditor />} />
          <Route path="solutions/:id" element={<SolutionEditor />} />
          <Route path="analytics/solution/:id" element={<SolutionMetrics />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthSession>
  );
};

export default AppRoutes;
