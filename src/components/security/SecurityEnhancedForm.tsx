import React, { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { validateFormSubmission } from '@/utils/serverValidation';
import { useAdvancedRateLimit } from '@/hooks/security/useAdvancedRateLimit';

interface SecurityEnhancedFormProps {
  schema: z.ZodSchema;
  onSubmit: (data: any) => Promise<void>;
  actionType: string;
  children: React.ReactNode;
  rateLimitConfig?: {
    maxAttempts?: number;
    windowMinutes?: number;
  };
  className?: string;
}

export const SecurityEnhancedForm: React.FC<SecurityEnhancedFormProps> = ({
  schema,
  onSubmit,
  actionType,
  children,
  rateLimitConfig,
  className = ''
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { isBlocked, remainingAttempts, resetTime, escalationLevel, blockReason } = useAdvancedRateLimit();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    setIsSubmitting(true);
    setValidationErrors([]);
    setSecurityAlert(null);
    setSubmitSuccess(false);

    try {
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());

      // Enhanced server-side validation
      const validation = await validateFormSubmission(
        data,
        schema,
        actionType,
        rateLimitConfig
      );

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      // Check for security issues
      const hasSecurityIssues = validation.errors.some(error => 
        error.includes('suspeitos') || 
        error.includes('malicioso') || 
        error.includes('injeção')
      );

      if (hasSecurityIssues) {
        setSecurityAlert('Entrada suspeita detectada. Por favor, revise os dados inseridos.');
        return;
      }

      // Submit with sanitized data
      await onSubmit(validation.sanitizedData);
      setSubmitSuccess(true);
      
      // Reset form
      event.currentTarget.reset();
      
    } catch (error) {
      console.error('Form submission error:', error);
      setValidationErrors(['Erro interno. Tente novamente.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBlocked) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Acesso temporariamente bloqueado</p>
              <p className="text-sm">{blockReason}</p>
              {escalationLevel > 0 && (
                <p className="text-sm text-destructive">
                  Nível de escalação: {escalationLevel} - Bloqueios repetidos resultam em penalidades maiores
                </p>
              )}
              {resetTime && (
                <p className="text-sm">
                  Tente novamente após: {resetTime.toLocaleString()}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Security Status Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Formulário protegido com validação avançada</span>
        {remainingAttempts !== null && remainingAttempts <= 3 && (
          <span className="text-warning">
            ({remainingAttempts} tentativas restantes)
          </span>
        )}
      </div>

      {/* Security Alert */}
      {securityAlert && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{securityAlert}</AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <Alert className="border-success text-success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Formulário enviado com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {/* Form Fields */}
      {children}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || isBlocked}
        className="w-full"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  );
};