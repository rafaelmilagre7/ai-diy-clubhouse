import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, UserCheck, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const acceptInviteSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z
    .string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;

const AcceptInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const validateInvite = async () => {
      if (!token) {
        setError('Token de convite não encontrado');
        setIsLoading(false);
        return;
      }

      try {
        // Verificar se o convite existe e é válido
        const { data, error } = await supabase
          .from('invites')
          .select(`
            *,
            user_roles(name, description)
          `)
          .eq('token', token)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError('Convite não encontrado ou inválido');
          setIsLoading(false);
          return;
        }

        // Verificar se ainda não foi usado
        if (data.used_at) {
          setError('Este convite já foi utilizado');
          setIsLoading(false);
          return;
        }

        // Verificar se não expirou
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        
        if (now > expiresAt) {
          setError('Este convite expirou');
          setIsLoading(false);
          return;
        }

        // Verificar se o email já está cadastrado
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', data.email.toLowerCase())
          .maybeSingle();

        if (existingUser) {
          setError('Este email já está cadastrado na plataforma');
          setIsLoading(false);
          return;
        }

        setInviteData(data);
        setIsLoading(false);

      } catch (err: any) {
        console.error('Erro ao validar convite:', err);
        setError('Erro ao validar convite');
        setIsLoading(false);
      }
    };

    validateInvite();
  }, [token]);

  const handleSubmit = async (values: AcceptInviteFormValues) => {
    if (!inviteData) return;

    try {
      setIsSubmitting(true);

      // Criar conta no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: inviteData.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
            invite_token: token,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('Erro ao criar conta');
      }

      // FRENTE 2: FALLBACK - Verificar se profile foi criado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      if (!profileCheck) {
        console.warn('⚠️ [ACCEPT-INVITE-FALLBACK] Profile não criado - criando manualmente');
        
        const { data: defaultRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('name', 'membro_club')
          .single();
        
        await supabase.from('profiles').insert({
          id: authData.user.id,
          email: authData.user.email!,
          name: values.name,
          role_id: defaultRole?.id,
          onboarding_completed: false,
          is_master_user: true
        });
        
        try {
          await supabase.rpc('log_orphan_profile_creation', {
            p_user_id: authData.user.id,
            p_created_by: 'AcceptInvite_fallback',
            p_metadata: { email: authData.user.email, timestamp: new Date().toISOString() }
          });
        } catch (err) {
          console.warn('Erro ao logar:', err);
        }
        
        console.log('✅ [ACCEPT-INVITE-FALLBACK] Profile criado manualmente');
      }

      // CORREÇÃO 1: Aplicar convite usando RPC que atualiza role e marca como usado
      try {
        const { data: inviteResult, error: inviteError } = await supabase.rpc('apply_invite_to_user', {
          p_invite_token: token,
          p_user_id: authData.user.id
        });

        if (inviteError) {
          console.error('❌ [ACCEPT-INVITE] Erro ao aplicar convite:', inviteError);
          toast.error('Conta criada mas houve problema ao aplicar o convite. Entre em contato.');
        } else if (inviteResult?.success) {
          console.log('✅ [ACCEPT-INVITE] Convite aplicado - role atualizado e convite marcado como usado');
        } else {
          console.warn('⚠️ [ACCEPT-INVITE] Convite não aplicado:', inviteResult?.message);
        }
      } catch (err) {
        console.error('❌ [ACCEPT-INVITE] Erro crítico ao aplicar convite:', err);
      }

      toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
      
      // Redirecionar para login
      navigate('/auth?message=account-created');

    } catch (err: any) {
      console.error('Erro ao aceitar convite:', err);
      toast.error(`Erro ao criar conta: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-md" />
          <p className="text-muted-foreground">Validando convite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-md">
        <Card className="max-w-md w-full">
          <CardHeader>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-md" />
            <CardTitle>Convite Inválido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link to="/auth">Ir para Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <UserCheck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bem-vindo!</h1>
            <p className="text-muted-foreground">
              Você foi convidado para se juntar à nossa plataforma
            </p>
          </div>
        </div>

        {/* Invite Info */}
        <Card>
          <CardContent className="pt-lg space-y-sm">
            <div className="flex items-center gap-sm">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{inviteData.email}</p>
                <p className="text-sm text-muted-foreground">
                  Papel: {inviteData.user_roles?.name}
                </p>
              </div>
            </div>
            
            {inviteData.notes && (
              <div className="bg-muted/50 p-sm rounded-lg">
                <p className="text-sm">{inviteData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Complete seu cadastro</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-md">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite seu nome completo"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Mínimo 8 caracteres"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar senha</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Digite a senha novamente"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-sm h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-sm h-4 w-4" />
                      Aceitar convite
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link to="/auth" className="font-medium text-primary hover:underline">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;