
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface InviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration: React.FC<InviteRegistrationProps> = ({ token: propToken }) => {
  const { token: paramToken } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const token = propToken || paramToken;
  
  const { inviteDetails, loading: inviteLoading, error: inviteError } = useInviteDetails(token);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  console.log('[ENHANCED-INVITE-REGISTRATION] Estado atual:', {
    token,
    inviteDetails,
    inviteLoading,
    inviteError,
    isSubmitting
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    
    if (!formData.password || formData.password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Senhas não conferem');
      return false;
    }
    
    return true;
  };

  const handleRegistration = async () => {
    if (!validateForm() || !inviteDetails) return;

    setIsSubmitting(true);
    
    try {
      console.log('[ENHANCED-INVITE-REGISTRATION] Iniciando registro para:', inviteDetails.email);

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteDetails.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            invite_token: token
          }
        }
      });

      if (authError) {
        console.error('[ENHANCED-INVITE-REGISTRATION] Erro na criação do usuário:', authError);
        toast.error(`Erro ao criar usuário: ${authError.message}`);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        console.error('[ENHANCED-INVITE-REGISTRATION] ID do usuário não encontrado');
        toast.error('Erro: ID do usuário não encontrado');
        return;
      }

      console.log('[ENHANCED-INVITE-REGISTRATION] Usuário criado com sucesso:', userId);

      // 2. Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: inviteDetails.email,
          name: formData.name,
          role_id: inviteDetails.role.id
        });

      if (profileError) {
        console.error('[ENHANCED-INVITE-REGISTRATION] Erro ao criar perfil:', profileError);
        toast.error('Erro ao criar perfil do usuário');
        return;
      }

      console.log('[ENHANCED-INVITE-REGISTRATION] Perfil criado com sucesso');

      // 3. Marcar convite como usado
      const { error: inviteUpdateError } = await supabase
        .from('invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', inviteDetails.id);

      if (inviteUpdateError) {
        console.error('[ENHANCED-INVITE-REGISTRATION] Erro ao marcar convite como usado:', inviteUpdateError);
        // Não falhar aqui, pois o usuário já foi criado
      }

      console.log('[ENHANCED-INVITE-REGISTRATION] Convite marcado como usado');

      setSuccess(true);
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      
      logger.info('Registro via convite concluído com sucesso', {
        component: 'EnhancedInviteRegistration',
        email: inviteDetails.email,
        role: inviteDetails.role.name
      });

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('[ENHANCED-INVITE-REGISTRATION] Erro inesperado:', error);
      toast.error(`Erro inesperado: ${error.message}`);
      
      logger.error('Erro no registro via convite', error, {
        component: 'EnhancedInviteRegistration'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estados de loading e erro
  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg">Validando convite...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteError || !inviteDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6" />
              <span className="text-lg font-semibold">Convite Inválido</span>
            </div>
            <p className="text-red-700 mb-4">
              {inviteError || 'Não foi possível validar o convite.'}
            </p>
            <Button 
              onClick={() => navigate('/login')} 
              variant="outline"
              className="w-full"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado de sucesso
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-green-600 mb-4">
              <CheckCircle className="h-8 w-8" />
              <span className="text-xl font-semibold">Sucesso!</span>
            </div>
            <p className="text-green-700 mb-4">
              Sua conta foi criada com sucesso. Você será redirecionado para o login em breve.
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulário de registro
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <UserPlus className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete seu Registro
          </CardTitle>
          <CardDescription>
            Você foi convidado como <strong>{inviteDetails.role.name}</strong>
            <br />
            Email: <strong>{inviteDetails.email}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite seu nome completo"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Crie uma senha (min. 6 caracteres)"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <Button
            onClick={handleRegistration}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate('/login')}
              disabled={isSubmitting}
            >
              Já tem uma conta? Fazer login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedInviteRegistration;
