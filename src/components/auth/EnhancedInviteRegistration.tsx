
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration = ({ token }: EnhancedInviteRegistrationProps) => {
  console.log('[ENHANCED-INVITE-REGISTRATION] Iniciando com token:', token);
  
  const navigate = useNavigate();
  const { inviteDetails, loading: inviteLoading, error: inviteError } = useInviteDetails(token);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'invite' | 'register' | 'complete'>('invite');

  // Atualizar email quando detalhes do convite carregarem
  useEffect(() => {
    if (inviteDetails?.email) {
      setFormData(prev => ({ ...prev, email: inviteDetails.email }));
      setRegistrationStep('register');
    }
  }, [inviteDetails]);

  // Exibir loading enquanto carrega detalhes do convite
  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg font-medium">Validando convite...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exibir erro se convite for inválido
  if (inviteError || !inviteDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <CardTitle className="text-red-800">Convite Inválido</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {inviteError || 'Convite não encontrado, expirado ou já utilizado.'}
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/login')}
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      console.log('[ENHANCED-INVITE-REGISTRATION] Iniciando registro com email:', formData.email);

      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      });

      if (authError) {
        console.error('[ENHANCED-INVITE-REGISTRATION] Erro no registro:', authError);
        throw authError;
      }

      console.log('[ENHANCED-INVITE-REGISTRATION] Usuário criado:', authData.user?.id);

      // 2. Aguardar criação do perfil (trigger automático)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Aplicar o convite usando a função RPC
      if (authData.user && token) {
        console.log('[ENHANCED-INVITE-REGISTRATION] Aplicando convite para usuário:', authData.user.id);
        
        const { data: inviteResult, error: inviteApplyError } = await supabase
          .rpc('use_invite', {
            invite_token: token,
            user_id: authData.user.id
          });

        console.log('[ENHANCED-INVITE-REGISTRATION] Resultado do convite:', inviteResult);

        if (inviteApplyError) {
          console.error('[ENHANCED-INVITE-REGISTRATION] Erro ao aplicar convite:', inviteApplyError);
          throw new Error(`Erro ao aplicar convite: ${inviteApplyError.message}`);
        }

        // Verificar se a aplicação do convite foi bem-sucedida
        if (inviteResult && typeof inviteResult === 'object' && 'status' in inviteResult) {
          if (inviteResult.status !== 'success') {
            throw new Error(inviteResult.message || 'Erro ao aplicar convite');
          }
        }
      }

      setRegistrationStep('complete');
      toast.success('Registro concluído com sucesso!');
      
      // Redirecionar após alguns segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('[ENHANCED-INVITE-REGISTRATION] Erro no processo:', error);
      toast.error(error.message || 'Erro ao processar registro');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar formulário de registro
  if (registrationStep === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Aceitar Convite</CardTitle>
            <CardDescription>
              Você foi convidado para: <strong>{inviteDetails.role.name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegistration} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar tela de conclusão
  if (registrationStep === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle className="text-green-800">Registro Concluído!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Sua conta foi criada com sucesso. Redirecionando para o dashboard...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
