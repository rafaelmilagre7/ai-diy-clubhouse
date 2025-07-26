import { useState, useCallback, useMemo, useRef } from 'react';
import { debounce } from '@/utils/performance';

/**
 * Hook otimizado para estados com debounce automático
 */
export const useDebouncedState = <T>(
  initialValue: T, 
  delay: number = 300
): [T, T, (value: T) => void] => {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  
  const debouncedSetValue = useMemo(
    () => debounce((newValue: T) => setDebouncedValue(newValue), delay),
    [delay]
  );
  
  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    debouncedSetValue(newValue);
  }, [debouncedSetValue]);
  
  return [value, debouncedValue, handleChange];
};

/**
 * Hook para estados complexos com otimização automática
 */
export const useOptimizedState = <T extends Record<string, any>>(
  initialState: T
) => {
  const [state, setState] = useState<T>(initialState);
  const prevStateRef = useRef<T>(initialState);
  
  const updateState = useCallback((updates: Partial<T> | ((prev: T) => Partial<T>)) => {
    setState(prev => {
      const newUpdates = typeof updates === 'function' ? updates(prev) : updates;
      const newState = { ...prev, ...newUpdates };
      
      // Otimização: só atualiza se realmente mudou
      const hasChanged = Object.keys(newUpdates).some(
        key => newState[key] !== prevStateRef.current[key]
      );
      
      if (hasChanged) {
        prevStateRef.current = newState;
        return newState;
      }
      
      return prev;
    });
  }, []);
  
  const resetState = useCallback(() => {
    setState(initialState);
    prevStateRef.current = initialState;
  }, [initialState]);
  
  return { state, updateState, resetState };
};

/**
 * Hook para listas com otimizações de performance
 */
export const useOptimizedList = <T>(
  initialItems: T[] = [],
  keyExtractor: (item: T, index: number) => string = (_, index) => index.toString()
) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const keysRef = useRef<string[]>([]);
  
  // Memoizar keys para evitar re-renders desnecessários
  const itemKeys = useMemo(() => {
    const newKeys = items.map(keyExtractor);
    keysRef.current = newKeys;
    return newKeys;
  }, [items, keyExtractor]);
  
  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);
  
  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const updateItem = useCallback((index: number, updater: (item: T) => T) => {
    setItems(prev => prev.map((item, i) => i === index ? updater(item) : item));
  }, []);
  
  const clearItems = useCallback(() => {
    setItems([]);
  }, []);
  
  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const item = newItems.splice(fromIndex, 1)[0];
      newItems.splice(toIndex, 0, item);
      return newItems;
    });
  }, []);
  
  return {
    items,
    itemKeys,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    moveItem,
    setItems
  };
};

/**
 * Hook para formulários otimizados
 */
export const useOptimizedForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
) => {
  const { state: values, updateState: updateValues, resetState: resetForm } = useOptimizedState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  const setValue = useCallback((field: keyof T, value: any) => {
    updateValues({ [field]: value } as Partial<T>);
    
    // Validação em tempo real
    if (validationRules?.[field] && touched[field]) {
      const error = validationRules[field]!(value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [updateValues, validationRules, touched]);
  
  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);
  
  const validateForm = useCallback(() => {
    if (!validationRules) return true;
    
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field as keyof T];
      if (rule) {
        const error = rule(values[field as keyof T]);
        if (error) {
          newErrors[field as keyof T] = error;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [validationRules, values]);
  
  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0
  };
};