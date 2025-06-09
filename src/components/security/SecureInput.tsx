
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { secureLogger } from '@/utils/secureLogger';
import { isSafeString } from '@/utils/securityUtils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSecureChange?: (value: string) => void;
  preventCopy?: boolean;
  preventPaste?: boolean;
  hideValue?: boolean;
  maxLength?: number;
  sanitizeInput?: boolean;
  validateInput?: (value: string) => { isValid: boolean; message?: string };
  securityLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export const SecureInput: React.FC<SecureInputProps> = ({
  onSecureChange,
  preventCopy = false,
  preventPaste = false,
  hideValue = false,
  maxLength,
  sanitizeInput = true,
  validateInput,
  securityLevel = 'medium',
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(props.value || '');
  const [validationError, setValidationError] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState(0);

  // Função para sanitizar entrada com níveis de segurança
  const sanitizeValue = useCallback((value: string): string => {
    if (!sanitizeInput) return value;
    
    let sanitized = value;
    
    // Nível básico - remover scripts óbvios
    if (securityLevel === 'low') {
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    // Nível médio - sanitização padrão
    if (securityLevel === 'medium') {
      sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:text\/html/gi, '');
    }
    
    // Nível alto - sanitização agressiva
    if (securityLevel === 'high') {
      sanitized = sanitized
        .replace(/<[^>]*>/g, '') // Remove todas as tags HTML
        .replace(/[<>\"'`]/g, '') // Remove caracteres potencialmente perigosos
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:/gi, '');
    }
    
    // Nível crítico - apenas alfanumérico e alguns caracteres especiais
    if (securityLevel === 'critical') {
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s@._-]/g, '');
    }
    
    return sanitized;
  }, [sanitizeInput, securityLevel]);

  // Validação de segurança
  const performSecurityValidation = useCallback((value: string): boolean => {
    // Verificar se o valor é seguro
    if (!isSafeString(value)) {
      secureLogger.security({
        type: 'data',
        severity: 'medium',
        description: 'Tentativa de input inseguro detectada',
        details: { 
          inputLength: value.length,
          securityLevel,
          fieldType: props.type || 'text'
        }
      }, 'SECURE_INPUT');
      
      setValidationError('Conteúdo não permitido detectado');
      return false;
    }
    
    // Validação customizada
    if (validateInput) {
      const validation = validateInput(value);
      if (!validation.isValid) {
        setValidationError(validation.message || 'Valor inválido');
        return false;
      }
    }
    
    setValidationError('');
    return true;
  }, [validateInput, props.type, securityLevel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Aplicar limite de caracteres se especificado
    if (maxLength && value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    
    // Sanitizar entrada se habilitado
    if (sanitizeInput) {
      const originalValue = value;
      value = sanitizeValue(value);
      
      // Log se houve sanitização
      if (originalValue !== value) {
        secureLogger.warn("Input sanitizado", "SECURE_INPUT", {
          originalLength: originalValue.length,
          sanitizedLength: value.length,
          securityLevel
        });
      }
    }
    
    // Validar segurança
    const isValid = performSecurityValidation(value);
    
    if (isValid) {
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
    } else {
      // Incrementar contador de tentativas suspeitas
      setAttemptCount(prev => prev + 1);
      
      if (attemptCount > 3) {
        secureLogger.security({
          type: 'data',
          severity: 'high',
          description: 'Múltiplas tentativas de input malicioso',
          details: { attempts: attemptCount + 1, securityLevel }
        }, 'SECURE_INPUT');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevenir copy/paste se configurado
    if (preventCopy && (e.ctrlKey || e.metaKey)) {
      if (e.key === 'c' || e.key === 'x') {
        e.preventDefault();
        secureLogger.info("Tentativa de cópia bloqueada", "SECURE_INPUT");
        return;
      }
    }
    
    if (preventPaste && (e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      secureLogger.info("Tentativa de cola bloqueada", "SECURE_INPUT");
      return;
    }

    props.onKeyDown?.(e);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLInputElement>) => {
    if (preventCopy || preventPaste) {
      e.preventDefault();
      secureLogger.info("Menu de contexto bloqueado", "SECURE_INPUT");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (preventPaste) {
      e.preventDefault();
      secureLogger.info("Cola bloqueada por política de segurança", "SECURE_INPUT");
      return;
    }

    // Sanitizar dados colados se habilitado
    if (sanitizeInput) {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      const sanitizedData = sanitizeValue(pastedData);
      
      if (sanitizedData !== pastedData) {
        secureLogger.warn("Dados colados foram sanitizados", "SECURE_INPUT", {
          originalLength: pastedData.length,
          sanitizedLength: sanitizedData.length
        });
      }
      
      const newValue = maxLength 
        ? sanitizedData.substring(0, maxLength)
        : sanitizedData;
      
      if (performSecurityValidation(newValue)) {
        setInternalValue(newValue);
        onSecureChange?.(newValue);
      }
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
    <div className="relative">
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
          validationError && 'border-red-500',
          className
        )}
        autoComplete={hideValue ? 'off' : props.autoComplete}
        data-security-level={securityLevel}
        data-security-critical={securityLevel === 'critical' ? 'true' : undefined}
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
      {validationError && (
        <div className="text-xs text-red-500 mt-1">
          {validationError}
        </div>
      )}
    </div>
  );
};
