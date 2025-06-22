
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Eye, EyeOff, Mail, User, Lock, UserPlus } from 'lucide-react';

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration = ({ token }: EnhancedInviteRegistrationProps) => {
  const navigate = useNavigate();
  const { signUp, isLoading: authLoading } = useAuth();
  const { inviteDetails, loading: inviteLoading, error: inviteError } = useInviteDetails(token);
  
  const [formData, setFormData] = useState({
    name: '',
    email: inviteDetails?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualizar email quando inviteDetails carregar
  useEffect(() => {
    if (inviteDetails?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: inviteDetails.email }));
    }
  }, [inviteDetails, formData.email]);

  // Mostrar loading enquanto carrega detalhes do convite
  if (inviteLoading) {
    return <LoadingScreen message="Validando convite..." />;
  }

  // Mostrar erro se convite inválido
  if (inviteError || !inviteDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Convite Inválido</CardTitle>
            <CardDescription>
              {inviteError || 'O convite não foi encontrado ou expirou'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('E-mail é obrigatório');
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não conferem');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!inviteDetails) return;

    setIsSubmitting(true);

    try {
      console.log('[INVITE-REGISTRATION] Iniciando registro com convite');

      // 1. Registrar usuário
      const { user, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.name,
          invite_token: token
        }
      );

      if (signUpError) {
        console.error('[INVITE-REGISTRATION] Erro no registro:', signUpError);
        toast.error(`Erro no registro: ${signUpError.message}`);
        return;
      }

      if (!user) {
        toast.error('Erro inesperado no registro');
        return;
      }

      console.log('[INVITE-REGISTRATION] Usuário registrado:', user.id);

      // 2. Aplicar convite (atualizar role e marcar como usado)
      const { data: useInviteResult, error: useInviteError } = await supabase
        .rpc('use_invite', {
          invite_token: token,
          user_id: user.id
        });

      if (useInviteError) {
        console.error('[INVITE-REGISTRATION] Erro ao aplicar convite:', useInviteError);
        toast.error(`Erro ao aplicar convite: ${useInviteError.message}`);
        return;
      }

      console.log('[INVITE-REGISTRATION] Resultado do uso do convite:', useInviteResult);

      if (useInviteResult?.status === 'error') {
        toast.error(`Erro: ${useInviteResult.message}`);
        return;
      }

      // 3. Sucesso!
      toast.success('Conta criada com sucesso! Bem-vindo à plataforma!');
      
      console.log('[INVITE-REGISTRATION] Registro completo, redirecionando...');
      
      // Redirecionar para onboarding
      navigate('/onboarding');

    } catch (error: any) {
      console.error('[INVITE-REGISTRATION] Erro inesperado:', error);
      toast.error(`Erro inesperado: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Você foi convidado!</CardTitle>
          <CardDescription>
            Complete seu cadastro para acessar a plataforma como{' '}
            <span className="font-semibold text-blue-600">
              {inviteDetails.role.name}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  className="pl-10 bg-gray-50"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500">
                E-mail definido pelo convite
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || authLoading}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline font-medium"
              >
                Fazer login
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedInviteRegistration;
