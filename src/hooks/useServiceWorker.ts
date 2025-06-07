
import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  updateAvailable: boolean;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isLoading: true,
    error: null,
    updateAvailable: false
  });

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    } else {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Service Worker não suportado' 
      }));
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      console.log('Service Worker registrado com sucesso:', registration);
      
      setState(prev => ({ 
        ...prev, 
        isRegistered: true, 
        isLoading: false 
      }));

      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ 
                ...prev, 
                updateAvailable: true 
              }));
            }
          });
        }
      });

      // Verificar se já existe um service worker controlando a página
      if (navigator.serviceWorker.controller) {
        setState(prev => ({ 
          ...prev, 
          isRegistered: true 
        }));
      }

    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Falha ao registrar Service Worker' 
      }));
    }
  };

  const updateServiceWorker = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return {
    ...state,
    updateServiceWorker
  };
};
