import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface FormStateOptions {
  debounceMs?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: Error | null;
  submitCount: number;
}

export function useFormState(options: FormStateOptions = {}) {
  const { debounceMs = 300, onSuccess, onError } = options;
  const { toast } = useToast();
  const debounceRef = useRef<NodeJS.Timeout>();
  
  const [state, setState] = useState<FormState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
    submitCount: 0
  });

  const resetState = useCallback(() => {
    setState({
      isSubmitting: false,
      isSuccess: false,
      error: null,
      submitCount: 0
    });
  }, []);

  const handleSubmit = useCallback(async <T>(
    submitFn: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    // Evitar múltiplas submissões
    if (state.isSubmitting) {
      return null;
    }

    // Debounce para evitar clicks rápidos
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    return new Promise((resolve) => {
      debounceRef.current = setTimeout(async () => {
        try {
          setState(prev => ({
            ...prev,
            isSubmitting: true,
            error: null,
            submitCount: prev.submitCount + 1
          }));

          const result = await submitFn();
          
          setState(prev => ({
            ...prev,
            isSubmitting: false,
            isSuccess: true
          }));

          if (successMessage) {
            toast({
              title: "Sucesso",
              description: successMessage,
            });
          }

          onSuccess?.();
          resolve(result);
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          
          setState(prev => ({
            ...prev,
            isSubmitting: false,
            error: errorObj
          }));

          toast({
            title: "Erro",
            description: errorObj.message,
            variant: "destructive",
          });

          onError?.(errorObj);
          resolve(null);
        }
      }, debounceMs);
    });
  }, [state.isSubmitting, debounceMs, toast, onSuccess, onError]);

  return {
    ...state,
    handleSubmit,
    resetState
  };
}