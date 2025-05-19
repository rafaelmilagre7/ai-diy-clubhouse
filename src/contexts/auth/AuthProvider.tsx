
import React, { useState, useEffect, useContext, createContext } from 'react';
import { AuthContextType } from './types';
import { cleanupAuthState } from './utils/authUtils';
import { AuthStateManager } from './managers/AuthStateManager';

// Criar o contexto de autenticação
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  signOut: async () => {}
});

// Hook para acessar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

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
