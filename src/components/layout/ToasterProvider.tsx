
import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export const ToasterProvider = () => {
  return (
    <SonnerToaster 
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 2000,
        className: 'toast-custom-class',
        style: {
          background: 'white',
          color: 'black',
        }
      }}
    />
  );
};
