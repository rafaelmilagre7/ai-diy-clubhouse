
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const CommunityRedirect = () => {
  const location = useLocation();
  
  // Se estiver na rota exata /comunidade, redireciona para /comunidade (index)
  if (location.pathname === '/comunidade') {
    return null; // Não redireciona, deixa carregar a página principal
  }
  
  return null;
};
