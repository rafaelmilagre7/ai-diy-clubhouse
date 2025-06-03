
import React from 'react';
import MemberLayout from './MemberLayout';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout para páginas autenticadas - inclui sidebar e header
 */
const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <MemberLayout>
      {children}
    </MemberLayout>
  );
};

export default AuthenticatedLayout;
