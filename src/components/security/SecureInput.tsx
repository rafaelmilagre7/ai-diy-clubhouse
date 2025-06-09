
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { detectInjectionAttempts } from '@/utils/securityUtils';
import { validateSecureInput } from '@/utils/validation';
import { logger } from '@/utils/logger';

interface SecureInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  validateInput?: (input: string) => { isValid: boolean; error?: string };
  maxLength?: number;
  className?: string;
  disabled?: boolean;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  validateInput,
  maxLength = 255,
  className,
  disabled = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Limitar comprimento
    if (inputValue.length > maxLength) {
      setError(`Máximo de ${maxLength} caracteres permitidos`);
      return;
    }
    
    setIsValidating(true);
    setError(null);
    
    try {
      // Detectar tentativas de injeção
      if (detectInjectionAttempts(inputValue)) {
        setError('Entrada contém conteúdo potencialmente perigoso');
        logger.warn('Tentativa de injeção detectada', {
          component: 'SECURE_INPUT',
          inputName: name,
          inputLength: inputValue.length
        });
        setIsValidating(false);
        return;
      }
      
      // Validação customizada se fornecida
      if (validateInput) {
        const validation = validateInput(inputValue);
        if (!validation.isValid) {
          setError(validation.error || 'Entrada inválida');
          setIsValidating(false);
          return;
        }
      } else {
        // Validação padrão baseada no tipo
        let validationType: 'email' | 'password' | 'name' | 'text' = 'text';
        
        if (type === 'email') validationType = 'email';
        else if (type === 'password') validationType = 'password';
        else if (name.toLowerCase().includes('name')) validationType = 'name';
        
        const validation = validateSecureInput(inputValue, validationType);
        if (!validation.isValid) {
          setError(validation.error || 'Entrada inválida');
          setIsValidating(false);
          return;
        }
      }
      
      // Se chegou até aqui, a entrada é válida
      onChange(inputValue);
      
    } catch (error) {
      logger.error('Erro na validação de entrada segura', {
        component: 'SECURE_INPUT',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      setError('Erro interno de validação');
    } finally {
      setIsValidating(false);
    }
  }, [name, maxLength, validateInput, onChange, type]);

  return (
    <div className="space-y-2">
      <Input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={className}
        disabled={disabled || isValidating}
        maxLength={maxLength}
      />
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isValidating && (
        <div className="text-sm text-gray-500">
          Validando entrada...
        </div>
      )}
    </div>
  );
};
