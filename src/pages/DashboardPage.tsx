
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/member/Dashboard';

const DashboardPage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Dashboard />;
};

export default DashboardPage;
