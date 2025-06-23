
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InviteJourneyProgress } from '@/components/invite/InviteJourneyProgress';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const EnhancedRegisterForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const token = searchParams.get('token');
  const prefilledEmail = searchParams.get('email');
  
  const { inviteDetails, loading, error: inviteError } = useInviteDetails(token || undefined);
  const { acceptInvite, isProcessing } = useInviteFlow();

  const [formData, setFormData] = useState({
    email: prefilledEmail || '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pré-preencher email quando detalhes do convite chegarem
  useEffect(() => {
    if (inviteDetails?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: inviteDetails.email }));
    }
  }, [inviteDetails, formData.email]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    // Validar se email corresponde ao convite
    if (token && inviteDetails && formData.email !== inviteDetails.email) {
      newErrors.email = 'Email deve corresponder ao convite recebido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('📝 [ENHANCED-REGISTER] Iniciando registro com convite:', { token, email: formData.email });
      
      // Registrar usuário
      const { error: signUpError } = await signUp(formData.email, formData.password);
      
      if (signUpError) {
        toast.error(`Erro no registro: ${signUpError.message}`);
        return;
      }

      // Se temos um token, aceitar o convite automaticamente após registro
      if (token && inviteDetails) {
        console.log('🎫 [ENHANCED-REGISTER] Aplicando convite após registro');
        
        // Aguardar um pouco para garantir que o usuário foi criado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = await acceptInvite(token);
        
        if (result.success) {
          toast.success('Conta criada e convite aceito com sucesso!');
          navigate('/onboarding?token=' + token);
        } else {
          toast.error(`Conta criada, mas erro ao aceitar convite: ${result.message}`);
          navigate('/onboarding');
        }
      } else {
        toast.success('Conta criada com sucesso!');
        navigate('/onboarding');
      }
      
    } catch (error: any) {
      console.error('❌ [ENHANCED-REGISTER] Erro no registro:', error);
      toast.error('Erro inesperado no registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando detalhes do convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (token && inviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert>
              <AlertDescription>
                {inviteError}
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/register')}
            >
              Continuar sem convite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Progress do convite */}
        {token && inviteDetails && (
          <InviteJourneyProgress
            currentPhase="registering"
            userEmail={inviteDetails.email}
            roleName={inviteDetails.role.name}
            percentage={40}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {token ? 'Complete seu Registro' : 'Criar Conta'}
            </CardTitle>
            {token && inviteDetails && (
              <p className="text-sm text-gray-600 text-center">
                Você foi convidado como <strong>{inviteDetails.role.name}</strong>
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!!token} // Desabilitar se veio de convite
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || isProcessing}
              >
                {isSubmitting || isProcessing ? 'Criando conta...' : 'Criar Conta'}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
