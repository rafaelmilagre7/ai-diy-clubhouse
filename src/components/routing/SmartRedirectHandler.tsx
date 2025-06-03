
import React from 'react';

// Componente vazio para evitar erros de importação
// O redirecionamento agora é feito diretamente nas rotas
export const SmartRedirectHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const SimpleRedirectHandler: React.FC = () => {
  return null;
};
