
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { logger } from '@/utils/logger';
import { auditLogger } from '@/utils/auditLogger';

interface SecureInputProps {
  type?: 'text' | 'email' | 'password' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  required?: boolean;
  autoComplete?: string;
  name?: string;
  disabled?: boolean;
  validateInput?: (value: string) => { isValid: boolean; error?: string };
}

export const SecureInput: React.FC<SecureInputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  className,
  maxLength = 255,
  required,
  autoComplete,
  name,
  disabled,
  validateInput
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastValidationRef = useRef<string>('');

  // Sanitizar entrada para prevenir XSS
  const sanitizeInput = useCallback((input: string): string => {
    if (!input) return '';
    
    return input
      .replace(/[<>'"]/g, '') // Remover caracteres perigosos
      .substring(0, maxLength) // Limitar comprimento
      .trim();
  }, [maxLength]);

  // Validação em tempo real com debounce
  useEffect(() => {
    if (!validateInput || value === lastValidationRef.current) return;
    
    const timeoutId = setTimeout(() => {
      try {
        const result = validateInput(value);
        setValidationError(result.isValid ? null : result.error || 'Entrada inválida');
        lastValidationRef.current = value;
      } catch (error) {
        logger.warn("Erro na validação de entrada", {
          component: 'SECURE_INPUT',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, validateInput]);

  // Detectar tentativas de injeção
  useEffect(() => {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i
    ];

    const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(value));
    
    if (hasSuspiciousContent && value.length > 0) {
      logger.warn("Tentativa de injeção detectada", {
        component: 'SECURE_INPUT',
        inputName: name,
        inputType: type
      });
      
      auditLogger.logSecurityEvent('input_injection_attempt', 'high', {
        inputName: name,
        inputType: type,
        suspiciousValue: value.substring(0, 50) + '...'
      });
    }
  }, [value, name, type]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeInput(rawValue);
    
    // Log tentativas de entrada de dados maliciosos
    if (rawValue !== sanitizedValue && rawValue.length > 0) {
      logger.warn("Entrada sanitizada", {
        component: 'SECURE_INPUT',
        original: rawValue.substring(0, 20) + '...',
        sanitized: sanitizedValue.substring(0, 20) + '...'
      });
    }
    
    onChange(sanitizedValue);
  }, [onChange, sanitizeInput]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasError = validationError !== null;

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`
            ${className}
            ${hasError ? 'border-status-error focus:border-status-error' : ''}
            ${isFocused ? 'ring-2 ring-operational/20' : ''}
            ${type === 'password' ? 'pr-20' : 'pr-10'}
          `}
          maxLength={maxLength}
          required={required}
          autoComplete={autoComplete}
          name={name}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
        />
        
        {/* Indicador de segurança */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {type === 'password' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={togglePasswordVisibility}
              className="h-6 w-6 p-0 hover:bg-transparent flex items-center justify-center"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? 
                <EyeOff className="h-4 w-4 flex-shrink-0" /> : 
                <Eye className="h-4 w-4 flex-shrink-0" />
              }
            </Button>
          )}
          
          {isFocused && !hasError && (
            <Shield 
              className="h-4 w-4 text-operational flex-shrink-0" 
              aria-label="Entrada protegida" 
            />
          )}
        </div>
      </div>
      
      {/* Mensagem de erro */}
      {hasError && (
        <p 
          id={`${name}-error`}
          className="mt-1 text-sm text-status-error"
          role="alert"
        >
          {validationError}
        </p>
      )}
    </div>
  );
};
