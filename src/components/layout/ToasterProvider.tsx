
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
        className: 'toast-custom-class bg-card text-foreground border border-border shadow-lg font-medium p-4 text-sm',
      }}
      visibleToasts={2}
      expand={false}
      pauseWhenPageIsHidden
    />
  );
};
