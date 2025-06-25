
import React from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { Navigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import Dashboard from '@/pages/member/Dashboard';

const DashboardPage = () => {
  const { user, isLoading } = useSimpleAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MemberLayout>
      <Dashboard />
    </MemberLayout>
  );
};

export default DashboardPage;
