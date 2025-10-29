import React, { useRef, useEffect } from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { ToastModern, type ToastModernRef } from '@/components/ui/toast-modern';
import { setGlobalToastRef, useToastModern } from '@/hooks/useToastModern';
import { setModernToastInstance } from '@/lib/toast-helpers';

export const ToastModernProvider = () => {
  const toastRef = useRef<ToastModernRef>(null);
  const toastInstance = useToastModern();

  useEffect(() => {
    setGlobalToastRef(toastRef.current);
    setModernToastInstance(toastInstance);
    return () => {
      setGlobalToastRef(null);
      setModernToastInstance(null);
    };
  }, [toastInstance]);

  return (
    <>
      <ToastModern ref={toastRef} defaultPosition="bottom-right" />
      <SonnerToaster 
        position="bottom-right"
        richColors={false}
        closeButton={false}
        toastOptions={{
          unstyled: true,
          className: 'flex justify-end',
        }}
        visibleToasts={3}
        expand={false}
        pauseWhenPageIsHidden
      />
    </>
  );
};
