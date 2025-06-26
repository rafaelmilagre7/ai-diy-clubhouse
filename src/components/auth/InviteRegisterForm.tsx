
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, User, Lock, UserPlus, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '@/lib/supabase';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface InviteRegisterFormProps {
  email: string;
  initialName?: string;
  token: string;
  onUserExists: () => void;
}

const schema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  password: yup.string().min(8, 'Senha deve ter no mínimo 8 caracteres').required('Senha é obrigatória'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Senhas não coincidem')
    .required('Confirme sua senha')
});

const InviteRegisterForm = ({ email, initialName, token, onUserExists }: InviteRegisterFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: initialName || '',
      email: email, // E-mail pré-preenchido e deve ser readonly
      password: '',
      confirmPassword: ''
    }
  });

  const watchedEmail = watch('email');

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // VALIDAÇÃO CRÍTICA: E-mail deve ser exatamente o do convite
      if (data.email !== email) {
        setError(`Este convite só pode ser usado com o e-mail ${email}. Por favor, use o e-mail correto.`);
        return;
      }

      logger.info('[INVITE-REGISTER] 📝 Tentativa de registro:', {
        email: data.email,
        hasName: !!data.name,
        token: token.substring(0, 8) + '***'
      });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            invite_token: token
          },
          emailRedirectTo: `${window.location.origin}/onboarding?token=${token}&invite=true`
        }
      });

      if (authError) {
        logger.error('[INVITE-REGISTER] ❌ Erro no registro:', authError);
        
        // Tratar caso de usuário já existente
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          logger.info('[INVITE-REGISTER] 👤 Usuário já existe - mostrando tela específica');
          onUserExists();
          return;
        }
        
        throw authError;
      }

      if (authData.user) {
        logger.info('[INVITE-REGISTER] ✅ Registro bem-sucedido:', {
          userId: authData.user.id,
          email: authData.user.email
        });

        // Armazenar token para o onboarding
        InviteTokenManager.storeToken(token);
        
        toast.success('Conta criada com sucesso! Redirecionando...');
        
        // Redirecionar para onboarding de convite
        navigate(`/onboarding?token=${token}&invite=true`);
      }

    } catch (error: any) {
      logger.error('[INVITE-REGISTER] ❌ Erro no registro:', error);
      setError(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-viverblue" />
          </div>
          <div>
            <CardTitle className="text-2xl">Criar Sua Conta</CardTitle>
            <p className="text-sm text-neutral-400 mt-2">
              Você foi convidado para se juntar à plataforma
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Alert informativo sobre o e-mail */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Este convite foi enviado para <strong className="text-viverblue">{email}</strong>. 
              Use exatamente este e-mail para criar sua conta.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Seu nome completo"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* E-mail (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail do Convite</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="email"
                  {...register('email')}
                  type="email"
                  className="pl-10 bg-neutral-50 text-neutral-600"
                  disabled={true} // Sempre disabled - não pode ser alterado
                />
              </div>
              {watchedEmail !== email && (
                <p className="text-sm text-red-500">
                  Este convite só funciona com o e-mail {email}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="password"
                  {...register('password')}
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Confirme sua senha"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || watchedEmail !== email}
              className="w-full bg-viverblue hover:bg-viverblue/80"
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta e Aceitar Convite'}
            </Button>
          </form>

          <div className="text-center text-sm text-neutral-400">
            Já tem uma conta?{' '}
            <button 
              onClick={() => navigate(`/login?invite=true&token=${token}`)}
              className="text-viverblue hover:underline"
            >
              Fazer login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteRegisterForm;
