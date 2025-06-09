
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSecureChange?: (value: string) => void;
  preventCopy?: boolean;
  preventPaste?: boolean;
  hideValue?: boolean;
  maxLength?: number;
  sanitizeInput?: boolean;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  onSecureChange,
  preventCopy = false,
  preventPaste = false,
  hideValue = false,
  maxLength,
  sanitizeInput = true,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(props.value || '');

  // Função para sanitizar entrada
  const sanitizeValue = (value: string): string => {
    if (!sanitizeInput) return value;
    
    // Remover caracteres potencialmente perigosos
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Sanitizar entrada se habilitado
    if (sanitizeInput) {
      value = sanitizeValue(value);
    }
    
    // Aplicar limite de caracteres se especificado
    if (maxLength && value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    
    setInternalValue(value);
    onSecureChange?.(value);
    
    // Criar novo evento com valor sanitizado
    const sanitizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: value
      }
    };
    
    props.onChange?.(sanitizedEvent as React.ChangeEvent<HTMLInputElement>);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevenir copy/paste se configurado
    if (preventCopy && (e.ctrlKey || e.metaKey)) {
      if (e.key === 'c' || e.key === 'x') {
        e.preventDefault();
        return;
      }
    }
    
    if (preventPaste && (e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      return;
    }

    props.onKeyDown?.(e);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLInputElement>) => {
    if (preventCopy || preventPaste) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (preventPaste) {
      e.preventDefault();
      return;
    }

    // Sanitizar dados colados se habilitado
    if (sanitizeInput) {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      const sanitizedData = sanitizeValue(pastedData);
      
      const newValue = maxLength 
        ? sanitizedData.substring(0, maxLength)
        : sanitizedData;
      
      setInternalValue(newValue);
      onSecureChange?.(newValue);
    }
  };

  // Limpar valor do componente quando desmontado (para campos sensíveis)
  useEffect(() => {
    return () => {
      if (hideValue) {
        setInternalValue('');
      }
    };
  }, [hideValue]);

  return (
    <Input
      {...props}
      value={internalValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      onPaste={handlePaste}
      className={cn(
        hideValue && 'select-none',
        preventCopy && 'user-select-none',
        className
      )}
      autoComplete={hideValue ? 'off' : props.autoComplete}
      style={{
        ...(hideValue && {
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none'
        }),
        ...props.style
      }}
    />
  );
};
