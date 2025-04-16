
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/auth';
import ProtectedRoute from './components/routing/ProtectedRoute';
import { Dashboard, Login, Register, ForgotPassword, ResetPassword, AdminDashboard, SolutionEditor, SolutionsList, ProfileSettings, SolutionDetails, SolutionImplementation, Error404, ImplementationConfirmation, ImplementationCompleted } from './pages';
import { MemberContent } from './components/layout/member/MemberContent';
import { AdminContent } from './components/layout/admin/AdminContent';
import { LoggingProvider } from './hooks/useLogging';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <AuthProvider>
      <LoggingProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/auth" element={<Login />} />
            
            {/* Member routes */}
            <Route path="/" element={<ProtectedRoute><MemberContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile-settings" element={<ProfileSettings />} />
              <Route path="solution/:id" element={<SolutionDetails />} />
            </Route>
            
            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="solutions" element={<SolutionsList />} />
              <Route path="solutions/edit/:id" element={<SolutionEditor />} />
              <Route path="solutions/new" element={<SolutionEditor />} />
            </Route>
            
            {/* Shared routes */}
            <Route path="*" element={<Error404 />} />

            {/* Implementation routes */}
            <Route path="/implement/:id/:moduleIndex" element={<ProtectedRoute><SolutionImplementation /></ProtectedRoute>} />
            <Route path="/implement/:id/confirm" element={<ProtectedRoute><ImplementationConfirmation /></ProtectedRoute>} />
            <Route path="/solution/:id/completed" element={<ProtectedRoute><ImplementationCompleted /></ProtectedRoute>} />
          </Routes>
        </Router>
      </LoggingProvider>
    </AuthProvider>
  );
}

export default App;
