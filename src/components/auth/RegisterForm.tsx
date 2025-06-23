
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthMethods } from '@/contexts/auth/hooks/useAuthMethods';
import { registerSchema, type RegisterFormData } from './schemas/authSchemas';
import { auditLogger } from '@/utils/auditLogger';

export interface RegisterFormProps {
  defaultEmail?: string;
  inviteToken?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  defaultEmail = '',
  inviteToken,
  onSuccess,
  onError
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { registerWithInvite } = useAuthMethods();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: defaultEmail,
      password: '',
      confirmPassword: '',
      name: '',
    },
  });

  const onSubmit = async (formData: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Log início do registro
      await auditLogger.logUserRegistration('registration_attempt', {
        email: formData.email,
        has_invite_token: !!inviteToken
      });

      const result = await registerWithInvite({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        inviteToken: inviteToken || undefined
      });

      if (result.error) {
        const errorMessage = result.error.message || 'Erro ao criar conta';
        setError(errorMessage);
        
        await auditLogger.logUserRegistration('registration_failed', {
          email: formData.email,
          error: errorMessage
        });
        
        if (onError) {
          onError(result.error);
        }
        return;
      }

      // Log sucesso
      await auditLogger.logUserRegistration('registration_success', {
        email: formData.email,
        user_id: result.user?.id
      });

      toast.success('Conta criada com sucesso!');
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Erro inesperado ao criar conta';
      setError(errorMessage);
      
      await auditLogger.logUserRegistration('registration_error', {
        email: formData.email,
        error: errorMessage
      });
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>
          {inviteToken ? 'Complete seu registro com o convite' : 'Preencha os dados para criar sua conta'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              disabled={isSubmitting || !!defaultEmail}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                {...register('password')}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme sua senha"
                {...register('confirmPassword')}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar conta'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
