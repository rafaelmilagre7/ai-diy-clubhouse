
import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export const ToasterProvider = () => {
  return (
    <SonnerToaster 
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        duration: 5000,
        className: 'toast-custom-class',
        style: {
          background: '#1A1E2E',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          fontWeight: 500,
          padding: '16px',
          fontSize: '15px',
        },
        success: {
          style: {
            backgroundColor: '#0ABAB5',
            color: 'white',
          },
        },
        error: {
          style: {
            backgroundColor: '#FF5A5A',
            color: 'white',
          },
        },
      }}
      visibleToasts={2}
      expand={false}
      pauseWhenPageIsHidden
    />
  );
};
