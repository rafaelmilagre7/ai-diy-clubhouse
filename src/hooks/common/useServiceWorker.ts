
import { useEffect } from 'react';
import { useLogging } from '@/contexts/logging';

export const useServiceWorker = () => {
  const { log, error } = useLogging();

  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      log('Registrando Service Worker...', {});
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      log('Service Worker registrado com sucesso', { 
        scope: registration.scope 
      });

      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              log('Nova versão do Service Worker disponível', {});
              
              // Notificar usuário sobre atualização (opcional)
              if (window.confirm('Nova versão disponível. Recarregar página?')) {
                window.location.reload();
              }
            }
          });
        }
      });

      // Limpar cache periodicamente
      setInterval(() => {
        if (registration.active) {
          registration.active.postMessage({ type: 'CLEAN_CACHE' });
        }
      }, 30 * 60 * 1000); // 30 minutos

    } catch (err) {
      error('Erro ao registrar Service Worker', { error: err });
    }
  };

  const updateServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        log('Service Worker atualizado', {});
      }
    } catch (err) {
      error('Erro ao atualizar Service Worker', { error: err });
    }
  };

  return { updateServiceWorker };
};
