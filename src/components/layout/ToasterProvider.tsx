
import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export const ToasterProvider = () => {
  // Configuração padrão sem depender do useLocation
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        duration: 2000,
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
