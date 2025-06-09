
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSecureChange?: (value: string) => void;
  preventCopy?: boolean;
  preventPaste?: boolean;
  hideValue?: boolean;
  maxLength?: number;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  onSecureChange,
  preventCopy = false,
  preventPaste = false,
  hideValue = false,
  maxLength,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(props.value || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Aplicar limite de caracteres se especificado
    if (maxLength && value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    
    setInternalValue(value);
    onSecureChange?.(value);
    props.onChange?.(e);
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
