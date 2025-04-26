
import React from 'react';
import AppRoutes from '@/components/routing/AppRoutes';

// Componente simplificado sem prefetch
const AppRoutesWrapper = () => {
  // Renderização direta das rotas, sem prefetch ou cache agressivo
  return <AppRoutes />;
};

export default AppRoutesWrapper;
