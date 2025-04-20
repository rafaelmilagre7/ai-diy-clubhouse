
import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export const ToasterProvider = () => {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        duration: 2000, // Reduzir para 2 segundos para notificações normais
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
