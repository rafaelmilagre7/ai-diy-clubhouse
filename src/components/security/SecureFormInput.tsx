/**
 * Input de formulário com proteção XSS integrada
 */
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { detectXSSAttempt, cleanSuspiciousInput } from '@/utils/security/xssProtection';
import { AlertTriangle, Shield } from 'lucide-react';

interface SecureFormInputProps {
  type?: 'text' | 'email' | 'password' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  context?: string;
  maxLength?: number;
  disabled?: boolean;
}

/**
 * Input seguro que detecta e previne tentativas XSS
 */
export const SecureFormInput: React.FC<SecureFormInputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  context = 'form_input',
  maxLength,
  disabled = false
}) => {
  const [hasXSSAttempt, setHasXSSAttempt] = useState(false);
  const [cleanValue, setCleanValue] = useState(value);

  // Monitorar mudanças no valor para detectar XSS
  useEffect(() => {
    const isXSS = detectXSSAttempt(value);
    setHasXSSAttempt(isXSS);
    
    if (isXSS) {
      const cleaned = cleanSuspiciousInput(value, context);
      setCleanValue(cleaned);
      // Atualizar com valor limpo
      onChange(cleaned);
    } else {
      setCleanValue(value);
    }
  }, [value, context, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Verificação imediata
    const isXSS = detectXSSAttempt(newValue);
    
    if (isXSS) {
      console.warn('[SECURE INPUT] Tentativa XSS bloqueada:', {
        context,
        input: newValue.substring(0, 50)
      });
      
      const cleaned = cleanSuspiciousInput(newValue, context);
      onChange(cleaned);
    } else {
      onChange(newValue);
    }
  };

  const commonProps = {
    value: cleanValue,
    onChange: handleChange,
    placeholder,
    className: `${className} ${hasXSSAttempt ? 'border-red-500 border-2' : ''}`,
    maxLength,
    disabled
  };

  return (
    <div className="relative">
      {/* Indicador de segurança */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        {hasXSSAttempt ? (
          <div title="Conteúdo suspeito detectado e limpo">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
        ) : (
          <div title="Input seguro">
            <Shield className="h-4 w-4 text-green-500 opacity-50" />
          </div>
        )}
      </div>

      {/* Input baseado no tipo */}
      {type === 'textarea' ? (
        <Textarea {...commonProps} />
      ) : (
        <Input 
          type={type} 
          {...commonProps}
        />
      )}

      {/* Aviso de segurança */}
      {hasXSSAttempt && (
        <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Conteúdo potencialmente malicioso foi detectado e removido
        </div>
      )}
    </div>
  );
};