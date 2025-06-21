
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { DynamicBrandLogo } from '@/components/common/DynamicBrandLogo';
import { toast } from 'sonner';
import { z } from 'zod';

// Schema de validação
const registrationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({ token }) => {
  console.log('[ENHANCED-INVITE] Token recebido via props:', token);
  
  const navigate = useNavigate();
  const { inviteDetails, loading, error } = useInviteDetails(token);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log('[ENHANCED-INVITE] Estado do convite:', {
      token,
      loading,
      error,
      inviteDetails
    });
  }, [token, loading, error, inviteDetails]);

  // Detectar tipo de usuário para o logo
  const userType = inviteDetails?.role?.name?.toLowerCase().includes('formacao') ? 'formacao' : 'club';
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro específico quando o usuário começar a digitar
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    try {
      registrationSchema.parse(formData);
      setValidationErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        return;
      }
    }

    if (!inviteDetails) {
      toast.error('Detalhes do convite não encontrados');
      return;
    }

    setIsRegistering(true);

    try {
      console.log('[ENHANCED-INVITE] Iniciando registro para:', inviteDetails.email);
      
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteDetails.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role_id: inviteDetails.role.id
          }
        }
      });

      if (authError) {
        console.error('[ENHANCED-INVITE] Erro na criação da conta:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Falha ao criar usuário');
      }

      console.log('[ENHANCED-INVITE] Conta criada com sucesso:', authData.user.id);

      // 2. Marcar convite como usado
      const { error: inviteError } = await supabase
        .from('invites')
        .update({ 
          used_at: new Date().toISOString(),
          used_by: authData.user.id
        })
        .eq('id', inviteDetails.id);

      if (inviteError) {
        console.error('[ENHANCED-INVITE] Erro ao marcar convite como usado:', inviteError);
        // Não falhar por este erro, apenas logar
      }

      // 3. Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          name: formData.name,
          email: inviteDetails.email,
          role_id: inviteDetails.role.id
        });

      if (profileError) {
        console.error('[ENHANCED-INVITE] Erro ao criar perfil:', profileError);
        // Não falhar por este erro se o perfil já existir
        if (!profileError.message.includes('duplicate key')) {
          throw profileError;
        }
      }

      toast.success('Conta criada com sucesso!');
      
      // Redirecionar baseado no tipo de usuário
      if (userType === 'formacao') {
        navigate('/formacao');
      } else {
        navigate('/onboarding');
      }

    } catch (error: any) {
      console.error('[ENHANCED-INVITE] Erro no registro:', error);
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsRegistering(false);
    }
  };

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <DynamicBrandLogo 
                userType={userType}
                className="h-40 w-auto mb-6"
              />
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Carregando detalhes do convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !inviteDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <DynamicBrandLogo 
                userType="club"
                className="h-40 w-auto mb-6"
              />
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error || 'Convite não encontrado ou inválido'}
                  <br />
                  <small className="text-xs opacity-75">Token: {token}</small>
                </AlertDescription>
              </Alert>
              <Button onClick={() => navigate('/auth')} variant="outline">
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <DynamicBrandLogo 
            userType={userType}
            className="h-40 w-auto mx-auto mb-6"
          />
          <CardTitle className="text-2xl font-bold text-gray-900">
            Finalizar Cadastro
          </CardTitle>
          <CardDescription className="text-gray-600">
            Você foi convidado para {inviteDetails.email}
            <br />
            <span className="text-sm font-medium text-blue-600">
              Cargo: {inviteDetails.role.name}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
                className={validationErrors.name ? 'border-red-500' : ''}
                required
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Escolha uma senha"
                className={validationErrors.password ? 'border-red-500' : ''}
                required
              />
              {validationErrors.password && (
                <p className="text-sm text-red-500">{validationErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirme sua senha"
                className={validationErrors.confirmPassword ? 'border-red-500' : ''}
                required
              />
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Criar Conta
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button
                onClick={() => navigate('/auth')}
                className="text-blue-600 hover:text-blue-700 font-medium"
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
