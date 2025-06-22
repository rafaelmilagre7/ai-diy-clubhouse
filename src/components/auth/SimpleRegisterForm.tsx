
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface SimpleRegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  defaultEmail?: string;
  inviteToken?: string;
}

export const SimpleRegisterForm: React.FC<SimpleRegisterFormProps> = ({
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

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
      setError('Todos os campos são obrigatórios');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const metadata = {
        name: formData.name,
        invite_token: inviteToken || undefined
      };

      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        metadata
      );

      if (signUpError) {
        console.error('[SIMPLE-REGISTER-FORM] Erro no registro:', signUpError);
        const errorMessage = signUpError.message === 'User already registered'
          ? 'Este email já está cadastrado. Tente fazer login.'
          : `Erro no registro: ${signUpError.message}`;
        
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      console.log('[SIMPLE-REGISTER-FORM] Registro realizado com sucesso');
      onSuccess?.();

    } catch (err: any) {
      console.error('[SIMPLE-REGISTER-FORM] Erro inesperado:', err);
      const errorMessage = 'Erro inesperado durante o registro';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    if (error) {
      setError('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Complete seu cadastro</h2>
        <p className="text-gray-600">
          Preencha os dados básicos. Após o cadastro, você completará seu perfil no onboarding.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="Seu nome completo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="seu@email.com"
            required
            disabled={!!defaultEmail}
          />
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Digite a senha novamente"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Criando conta...' : 'Criar conta e continuar'}
        </Button>

        <div className="text-center text-sm text-gray-500">
          Após criar sua conta, você será direcionado para completar seu perfil.
        </div>
      </form>
    </div>
  );
};

export default SimpleRegisterForm;
