
import React, { useState, useCallback, useMemo } from 'react';
import { Phone, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WhatsAppInputProps {
  value?: string;
  onChange: (value: string) => void;
  getFieldError?: (field: string) => string | undefined;
}

// Função para formatar telefone brasileiro
const formatPhoneNumber = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = numbers.substring(0, 11);
  
  // Aplica formatação baseada no tamanho
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 7) {
    return `(${limited.substring(0, 2)}) ${limited.substring(2)}`;
  } else if (limited.length <= 11) {
    const ddd = limited.substring(0, 2);
    const firstPart = limited.substring(2, 7);
    const secondPart = limited.substring(7);
    return `(${ddd}) ${firstPart}-${secondPart}`;
  }
  
  return limited;
};

// Função para validar telefone brasileiro
const validatePhoneNumber = (phone: string): { isValid: boolean; message?: string } => {
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length === 0) {
    return { isValid: false, message: 'WhatsApp é obrigatório' };
  }
  
  if (numbers.length < 10) {
    return { isValid: false, message: 'Número muito curto' };
  }
  
  if (numbers.length === 10) {
    // Formato antigo (XX) XXXX-XXXX
    return { isValid: true };
  }
  
  if (numbers.length === 11) {
    // Formato novo (XX) 9XXXX-XXXX
    const ninthDigit = numbers.charAt(2);
    if (ninthDigit !== '9') {
      return { isValid: false, message: 'Celular deve começar com 9' };
    }
    return { isValid: true };
  }
  
  if (numbers.length > 11) {
    return { isValid: false, message: 'Número muito longo' };
  }
  
  return { isValid: false, message: 'Formato inválido' };
};

export const WhatsAppInput: React.FC<WhatsAppInputProps> = ({
  value = '',
  onChange,
  getFieldError
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Validação em tempo real
  const validation = useMemo(() => {
    if (!value) return { isValid: false };
    return validatePhoneNumber(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue);
    onChange(formattedValue);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const fieldError = getFieldError?.('phone');
  const showValidation = value.length > 0 && !isFocused;
  const isValid = validation.isValid;
  const validationMessage = fieldError || validation.message;

  return (
    <div>
      <Label htmlFor="phone" className="text-foreground">
        WhatsApp *
      </Label>
      <div className="relative mt-1">
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          id="phone"
          type="tel"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`pl-10 pr-10 bg-background border-border text-foreground ${
            showValidation 
              ? isValid 
                ? 'border-green-500 focus:border-green-500' 
                : 'border-red-500 focus:border-red-500'
              : ''
          }`}
          placeholder="(11) 99999-9999"
          maxLength={15} // Formato: (XX) XXXXX-XXXX
        />
        
        {/* Indicador de validação */}
        {showValidation && value.length > 0 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Mensagens de erro/validação */}
      {validationMessage && showValidation && (
        <p className={`text-sm mt-1 ${isValid ? 'text-green-400' : 'text-red-400'}`}>
          {validationMessage}
        </p>
      )}
      
      {/* Dica de formato */}
      {isFocused && !value && (
        <p className="text-xs text-muted-foreground mt-1">
          Formato: (11) 99999-9999
        </p>
      )}
    </div>
  );
};
