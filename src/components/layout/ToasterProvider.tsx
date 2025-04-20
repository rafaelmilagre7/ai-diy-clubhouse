
import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export const ToasterProvider = () => {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: 'toast-custom-class',
        // Duração maior para erros
        error: {
          duration: 8000,
        }
      }}
    />
  );
};
