
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
        },
        // Configurações específicas para tipos de toast
        success: {
          duration: 2000, // 2 segundos para sucesso
        },
        error: {
          duration: 5000, // 5 segundos para erros
        },
        warning: {
          duration: 4000, // 4 segundos para avisos
        },
        info: {
          duration: 3000, // 3 segundos para informações
        }
      }}
    />
  );
};
