import { useRef, useCallback } from 'react';
import type { ToastModernRef, ToastModernProps } from '@/components/ui/toast-modern';

type ToastId = string | number;

interface UseToastModernReturn {
  showToast: (props: ToastModernProps) => ToastId;
  dismissToast: (toastId: ToastId) => void;
  showSuccess: (title: string, message: string, options?: Partial<ToastModernProps>) => ToastId;
  showError: (title: string, message: string, options?: Partial<ToastModernProps>) => ToastId;
  showWarning: (title: string, message: string, options?: Partial<ToastModernProps>) => ToastId;
  showInfo: (title: string, message: string, options?: Partial<ToastModernProps>) => ToastId;
  showLoading: (title: string, message: string, options?: Partial<ToastModernProps>) => ToastId;
  showSuccessWithAction: (
    title: string,
    message: string,
    action: { label: string; onClick: () => void },
    options?: Partial<ToastModernProps>
  ) => ToastId;
  showErrorWithRetry: (
    title: string,
    message: string,
    onRetry: () => void,
    options?: Partial<ToastModernProps>
  ) => ToastId;
}

// Store global reference to toast functions
let globalToastRef: ToastModernRef | null = null;

export const setGlobalToastRef = (ref: ToastModernRef | null) => {
  globalToastRef = ref;
};

export const useToastModern = (): UseToastModernReturn => {
  const toastRef = useRef<ToastModernRef>(globalToastRef);

  const showToast = useCallback((props: ToastModernProps): ToastId => {
    if (!toastRef.current && !globalToastRef) {
      console.warn('ToastModern ref not initialized');
      return '';
    }
    const ref = toastRef.current || globalToastRef;
    return ref!.show(props);
  }, []);

  const dismissToast = useCallback((toastId: ToastId) => {
    if (!toastRef.current && !globalToastRef) return;
    const ref = toastRef.current || globalToastRef;
    ref!.dismiss(toastId);
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string, options?: Partial<ToastModernProps>): ToastId => {
      return showToast({
        title,
        message,
        variant: 'success',
        position: 'bottom-right',
        ...options,
      });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message: string, options?: Partial<ToastModernProps>): ToastId => {
      return showToast({
        title,
        message,
        variant: 'error',
        position: 'top-center',
        duration: 6000,
        ...options,
      });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message: string, options?: Partial<ToastModernProps>): ToastId => {
      return showToast({
        title,
        message,
        variant: 'warning',
        position: 'bottom-right',
        ...options,
      });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message: string, options?: Partial<ToastModernProps>): ToastId => {
      return showToast({
        title,
        message,
        variant: 'info',
        position: 'bottom-right',
        ...options,
      });
    },
    [showToast]
  );

  const showLoading = useCallback(
    (title: string, message: string, options?: Partial<ToastModernProps>): ToastId => {
      return showToast({
        title,
        message,
        variant: 'loading',
        position: 'top-center',
        ...options,
      });
    },
    [showToast]
  );

  const showSuccessWithAction = useCallback(
    (
      title: string,
      message: string,
      action: { label: string; onClick: () => void },
      options?: Partial<ToastModernProps>
    ): ToastId => {
      return showToast({
        title,
        message,
        variant: 'success',
        action,
        position: 'bottom-right',
        highlightTitle: true,
        ...options,
      });
    },
    [showToast]
  );

  const showErrorWithRetry = useCallback(
    (
      title: string,
      message: string,
      onRetry: () => void,
      options?: Partial<ToastModernProps>
    ): ToastId => {
      return showToast({
        title,
        message,
        variant: 'error',
        action: {
          label: 'Tentar novamente',
          onClick: onRetry,
        },
        position: 'top-center',
        duration: 8000,
        ...options,
      });
    },
    [showToast]
  );

  return {
    showToast,
    dismissToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showSuccessWithAction,
    showErrorWithRetry,
  };
};
