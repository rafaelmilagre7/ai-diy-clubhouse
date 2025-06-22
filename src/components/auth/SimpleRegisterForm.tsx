
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useInviteDetails } from '@/hooks/useInviteDetails';

interface SimpleRegisterFormProps {
  onSuccess?: () => void;
  defaultEmail?: string;
  inviteToken?: string;
}

export const SimpleRegisterForm: React.FC<SimpleRegisterFormProps> = ({
  onSuccess,
  defaultEmail = '',
  inviteToken
}) => {
  const { signUp } = useAuth();
  const { inviteDetails } = useInviteDetails(inviteToken);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: defaultEmail || inviteDetails?.email || '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
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
        name: formData.name || undefined,
        invite_token: inviteToken || undefined,
        // Flag para indicar que vem de convite - força limpeza
        from_invite: !!inviteToken
      };

      console.log('[SIMPLE-REGISTER] Registrando com metadata:', metadata);

      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        metadata
      );

      if (signUpError) {
        console.error('[SIMPLE-REGISTER] Erro no registro:', signUpError);
        const errorMessage = signUpError.message === 'User already registered'
          ? 'Este email já está cadastrado. Tente fazer login.'
          : `Erro no registro: ${signUpError.message}`;
        
        setError(errorMessage);
        return;
      }

      console.log('[SIMPLE-REGISTER] Registro realizado com sucesso');
      onSuccess?.();

    } catch (err: any) {
      console.error('[SIMPLE-REGISTER] Erro inesperado:', err);
      setError('Erro inesperado durante o registro');
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

  const isInviteMode = !!inviteToken;
  const displayEmail = formData.email || inviteDetails?.email || '';

  return (
    <div className="space-y-4">
      {isInviteMode && inviteDetails && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Aceitar Convite</h2>
          <p className="text-gray-600">
            Você foi convidado para {inviteDetails.role.name}
          </p>
          <p className="text-sm text-gray-500">
            Email: {inviteDetails.email}
          </p>
        </div>
      )}

      {!isInviteMode && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
          <p className="text-gray-600">
            Crie sua conta para começar
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Nome (opcional)</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="Seu nome completo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={displayEmail}
            onChange={handleInputChange('email')}
            placeholder="seu@email.com"
            required
            disabled={isInviteMode}
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
          {isLoading ? 'Criando conta...' : (isInviteMode ? 'Aceitar Convite' : 'Criar conta')}
        </Button>
      </form>
    </div>
  );
};

export default SimpleRegisterForm;
