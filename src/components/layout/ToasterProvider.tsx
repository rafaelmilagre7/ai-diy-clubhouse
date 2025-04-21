
import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { useLocation } from 'react-router-dom';

export const ToasterProvider = () => {
  const location = useLocation();
  
  // Verificar se estamos na rota de onboarding
  const isOnboarding = location.pathname.includes('/onboarding');
  
  // Se estivermos na rota de onboarding, reduzimos a duração ou ocultamos
  const toastDuration = isOnboarding ? 1000 : 2000;

  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        duration: toastDuration,
        className: 'toast-custom-class',
        // Configurações específicas para cada tipo de toast
        style: {
          background: 'white',
          color: 'black',
        }
      }}
    />
  );
};
