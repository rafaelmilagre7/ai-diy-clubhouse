
import React, { useState, useEffect } from 'react';
import { AuthContextType } from './types';
import { useRouter } from '@/hooks/useRouter';
import { cleanupAuthState } from './utils/authUtils';
import { AuthStateManager } from './managers/AuthStateManager';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Estado de autenticação já é gerenciado no AuthStateManager

  return (
    <AuthStateManager>
      {children}
    </AuthStateManager>
  );
};

export default AuthProvider;
