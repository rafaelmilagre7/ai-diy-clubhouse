
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children?: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  // Layout simplificado - a lógica de login agora está diretamente na página
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default AuthLayout;
