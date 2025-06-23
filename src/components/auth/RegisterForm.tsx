
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  defaultEmail?: string;
  inviteToken?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onError,
  defaultEmail = '',
  inviteToken
}) => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: defaultEmail,
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case 'email':
        if (!value) {
          errors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Email inválido';
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Senha é obrigatória';
        } else if (value.length < 6) {
          errors.password = 'A senha deve ter pelo menos 6 caracteres';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Confirmação de senha é obrigatória';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'As senhas não coincidem';
        }
        break;
    }

    return errors;
  };

  const validateForm = () => {
    const allErrors: Record<string, string> = {};

    // Validar todos os campos
    Object.entries(formData).forEach(([field, value]) => {
      const fieldErrors = validateField(field, value);
      Object.assign(allErrors, fieldErrors);
    });

    // Validação adicional para confirmação de senha
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      allErrors.confirmPassword = 'As senhas não coincidem';
    }

    setValidationErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      logger.info('Iniciando processo de registro:', {
        email: formData.email,
        hasInviteToken: !!inviteToken,
        component: 'REGISTER_FORM'
      });

      const metadata = {
        name: formData.name || undefined,
        invite_token: inviteToken || undefined
      };

      const { error: signUpError, partialSuccess } = await signUp(
        formData.email,
        formData.password,
        metadata
      );

      if (signUpError) {
        logger.error('Erro no registro via RegisterForm:', signUpError, {
          component: 'REGISTER_FORM',
          email: formData.email
        });
        
        setError(signUpError.message);
        onError?.(signUpError.message);
        return;
      }

      logger.info('Registro concluído com sucesso:', {
        email: formData.email,
        partialSuccess,
        component: 'REGISTER_FORM'
      });

      if (partialSuccess) {
        // Usuário criado mas convite teve problema
        setError('Conta criada com sucesso, mas houve um problema com o convite. Entre em contato com o administrador.');
      }

      onSuccess?.();

    } catch (err: any) {
      logger.error('Erro inesperado no registro:', err, {
        component: 'REGISTER_FORM',
        email: formData.email
      });
      
      const errorMessage = err?.message || 'Erro inesperado durante o registro';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erros ao digitar
    if (error) {
      setError('');
    }

    // Validação em tempo real
    const fieldErrors = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: fieldErrors[field] || ''
    }));

    // Validação especial para confirmação de senha
    if (field === 'password' && formData.confirmPassword) {
      const confirmErrors = validateField('confirmPassword', formData.confirmPassword);
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: confirmErrors.confirmPassword || ''
      }));
    }
  };

  const getFieldStatus = (field: string) => {
    if (validationErrors[field]) return 'error';
    if (formData[field as keyof typeof formData]) return 'success';
    return 'default';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome (opcional)</Label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="Seu nome completo"
            className={getFieldStatus('name') === 'success' ? 'border-green-500' : ''}
          />
          {getFieldStatus('name') === 'success' && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="seu@email.com"
            required
            disabled={!!defaultEmail}
            className={`${
              validationErrors.email ? 'border-red-500' : 
              getFieldStatus('email') === 'success' ? 'border-green-500' : ''
            }`}
          />
          {getFieldStatus('email') === 'success' && !validationErrors.email && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {validationErrors.email && (
          <p className="text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="Mínimo 6 caracteres"
            required
            className={`pr-10 ${
              validationErrors.password ? 'border-red-500' : 
              getFieldStatus('password') === 'success' ? 'border-green-500' : ''
            }`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {validationErrors.password && (
          <p className="text-sm text-red-600">{validationErrors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Digite a senha novamente"
            required
            className={`${
              validationErrors.confirmPassword ? 'border-red-500' : 
              getFieldStatus('confirmPassword') === 'success' ? 'border-green-500' : ''
            }`}
          />
          {getFieldStatus('confirmPassword') === 'success' && !validationErrors.confirmPassword && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {validationErrors.confirmPassword && (
          <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || Object.keys(validationErrors).some(key => validationErrors[key])}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar conta'
        )}
      </Button>

      {inviteToken && (
        <div className="text-center text-sm text-muted-foreground">
          <CheckCircle className="inline h-4 w-4 mr-1 text-green-500" />
          Você está usando um convite válido
        </div>
      )}
    </form>
  );
};

export default RegisterForm;
