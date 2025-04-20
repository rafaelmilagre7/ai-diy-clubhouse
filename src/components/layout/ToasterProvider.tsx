
import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export const ToasterProvider = () => {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: 'toast-custom-class',
        // Configurações específicas para cada tipo de toast
        // Estas opções são suportadas pela API do Toaster
        style: {
          background: 'white',
          color: 'black',
        }
      }}
    />
  );
};
