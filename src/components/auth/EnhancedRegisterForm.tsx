
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, Mail, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { useInviteJourney } from '@/hooks/useInviteJourney';
import { Card } from '@/components/ui/card';

interface EnhancedRegisterFormProps {
  onSuccess?: () => void;
  defaultEmail?: string;
  inviteToken?: string;
}

export const EnhancedRegisterForm: React.FC<EnhancedRegisterFormProps> = ({
  onSuccess,
  defaultEmail = '',
  inviteToken
}) => {
  const { signUp } = useAuth();
  const { inviteDetails, isLoading: inviteLoading } = useInviteDetails(inviteToken);
  const { journeyState } = useInviteJourney(inviteToken);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');

  // Pré-preencher dados quando convite for carregado
  useEffect(() => {
    if (inviteDetails && !formData.email) {
      console.log('📝 [ENHANCED-REGISTER] Pré-preenchendo dados do convite');
      setFormData(prev => ({
        ...prev,
        email: inviteDetails.email,
        name: prev.name || '' // Manter nome se já preenchido
      }));
    }
  }, [inviteDetails, formData.email]);

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
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
        from_invite: !!inviteToken,
        // Dados do convite para referência
        invite_role: inviteDetails?.role?.name || undefined,
        invite_email: inviteDetails?.email || undefined
      };

      console.log('[ENHANCED-REGISTER] Registrando com metadata completa:', {
        ...metadata,
        invite_token: inviteToken ? inviteToken.substring(0, 8) + '...' : undefined
      });

      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        metadata
      );

      if (signUpError) {
        console.error('[ENHANCED-REGISTER] Erro no registro:', signUpError);
        const errorMessage = signUpError.message === 'User already registered'
          ? 'Este email já está cadastrado. Tente fazer login.'
          : `Erro no registro: ${signUpError.message}`;
        
        setError(errorMessage);
        return;
      }

      console.log('[ENHANCED-REGISTER] Registro realizado com sucesso');
      onSuccess?.();

    } catch (err: any) {
      console.error('[ENHANCED-REGISTER] Erro inesperado:', err);
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

  // Loading melhorado
  if (inviteLoading && isInviteMode) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto"></div>
          <p className="text-slate-600">Carregando informações do convite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header contextual */}
      {isInviteMode && inviteDetails ? (
        <Card className="p-4 border-l-4 border-l-viverblue bg-blue-50/50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <UserCheck className="h-6 w-6 text-viverblue mt-0.5" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Você foi convidado!</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email: {inviteDetails.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Função: {inviteDetails.role.name}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Complete seu cadastro para aceitar o convite automaticamente.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
          <p className="text-gray-600">
            Crie sua conta para começar sua jornada
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
          <Label htmlFor="email">
            Email * {isInviteMode && <span className="text-sm text-gray-500">(pré-preenchido do convite)</span>}
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="seu@email.com"
            required
            disabled={isInviteMode}
            className={isInviteMode ? 'bg-gray-50' : ''}
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
          {isLoading 
            ? 'Criando conta...' 
            : (isInviteMode ? 'Aceitar Convite e Criar Conta' : 'Criar conta')
          }
        </Button>
      </form>

      {/* Progress indicator para convites */}
      {isInviteMode && (
        <div className="text-center text-sm text-gray-500">
          <p>Após criar sua conta, você será redirecionado para completar seu perfil</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedRegisterForm;
