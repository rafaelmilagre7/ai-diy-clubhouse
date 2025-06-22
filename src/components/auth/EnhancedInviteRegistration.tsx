
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, User, Building, Mail } from 'lucide-react';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({ token }) => {
  const navigate = useNavigate();
  const { inviteDetails, loading: loadingInvite, error: inviteError } = useInviteDetails(token);
  const { acceptInvite, isProcessing } = useInviteFlow();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: '',
    position: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'form' | 'processing' | 'success'>('form');

  // Pré-preencher email quando detalhes do convite carregarem
  useEffect(() => {
    if (inviteDetails?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: inviteDetails.email }));
    }
  }, [inviteDetails, formData.email]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Preencha todos os campos obrigatórios');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    return true;
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token || !inviteDetails) {
      return;
    }

    setIsRegistering(true);
    setRegistrationStep('processing');

    try {
      console.log('[EnhancedInviteRegistration] Iniciando registro:', {
        email: formData.email,
        name: formData.name,
        token
      });

      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            company: formData.company,
            position: formData.position
          }
        }
      });

      if (authError) {
        console.error('[EnhancedInviteRegistration] Erro na criação da conta:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Falha ao criar usuário');
      }

      console.log('[EnhancedInviteRegistration] Conta criada com sucesso:', authData.user.id);

      // 2. Aguardar um pouco para garantir que o trigger do perfil seja executado
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Verificar se perfil foi criado, senão criar manualmente
      let profileCreated = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!profileCreated && attempts < maxAttempts) {
        attempts++;
        
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (profileCheckError) {
          console.error('[EnhancedInviteRegistration] Erro ao verificar perfil:', profileCheckError);
        }

        if (existingProfile) {
          console.log('[EnhancedInviteRegistration] Perfil encontrado:', existingProfile.id);
          profileCreated = true;
        } else {
          console.log(`[EnhancedInviteRegistration] Tentativa ${attempts}: Criando perfil manualmente`);
          
          // Criar perfil manualmente
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: formData.email,
              name: formData.name,
              company: formData.company || null,
              position: formData.position || null,
              role_id: inviteDetails.role.id,
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (createProfileError) {
            console.error('[EnhancedInviteRegistration] Erro ao criar perfil:', createProfileError);
            if (attempts === maxAttempts) {
              throw createProfileError;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.log('[EnhancedInviteRegistration] Perfil criado manualmente');
            profileCreated = true;
          }
        }
      }

      if (!profileCreated) {
        throw new Error('Falha ao criar perfil do usuário após múltiplas tentativas');
      }

      // 4. Aceitar o convite
      console.log('[EnhancedInviteRegistration] Aceitando convite...');
      const inviteResult = await acceptInvite(token);
      
      if (!inviteResult.success) {
        throw new Error(inviteResult.message);
      }

      console.log('[EnhancedInviteRegistration] Convite aceito com sucesso');
      
      setRegistrationStep('success');
      toast.success('Conta criada e convite aceito com sucesso!');

      // 5. Redirecionar após breve pausa
      setTimeout(() => {
        navigate('/onboarding', { replace: true });
      }, 2000);

    } catch (error: any) {
      console.error('[EnhancedInviteRegistration] Erro no registro:', error);
      
      let errorMessage = 'Erro inesperado durante o registro';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está registrado. Faça login para aceitar o convite.';
      } else if (error.message?.includes('Invalid invite')) {
        errorMessage = 'Convite inválido ou expirado';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setRegistrationStep('form');
    } finally {
      setIsRegistering(false);
    }
  };

  // Estados de carregamento e erro
  if (loadingInvite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-viverblue mx-auto mb-4" />
          <p className="text-slate-300">Verificando convite...</p>
        </motion.div>
      </div>
    );
  }

  if (inviteError || !inviteDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#1A1E2E]/80 backdrop-blur-sm border-red-500/30">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Convite Inválido</h2>
              <p className="text-slate-300 mb-4">
                {inviteError || 'Este convite não foi encontrado ou já expirou.'}
              </p>
              <Button onClick={() => navigate('/login')} variant="outline">
                Ir para Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Tela de sucesso
  if (registrationStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <Card className="bg-[#1A1E2E]/80 backdrop-blur-sm border-viverblue/30">
            <CardContent className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle className="h-16 w-16 text-viverblue mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-white mb-2">Bem-vindo!</h2>
              <p className="text-slate-300 mb-4">
                Sua conta foi criada e o convite foi aceito com sucesso.
              </p>
              <p className="text-sm text-slate-400">
                Redirecionando para o onboarding...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Formulário de registro
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Complete seu Registro
            </CardTitle>
            <p className="text-slate-300 text-sm">
              Você foi convidado para ser <strong className="text-viverblue">{inviteDetails.role.name}</strong>
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {registrationStep === 'processing' ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Loader2 className="h-8 w-8 animate-spin text-viverblue mx-auto mb-4" />
                <p className="text-slate-300">Criando sua conta e aceitando o convite...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRegistration} className="space-y-4">
                {/* Email (pré-preenchido) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-[#151823] border-white/10 text-white"
                    disabled
                  />
                </div>

                {/* Nome completo */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome completo *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-[#151823] border-white/10 text-white"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                {/* Empresa */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-slate-300 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Empresa
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="bg-[#151823] border-white/10 text-white"
                    placeholder="Nome da empresa"
                  />
                </div>

                {/* Cargo */}
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-slate-300">
                    Cargo
                  </Label>
                  <Input
                    id="position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="bg-[#151823] border-white/10 text-white"
                    placeholder="Seu cargo"
                  />
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    Senha *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="bg-[#151823] border-white/10 text-white"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>

                {/* Confirmar senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">
                    Confirmar senha *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="bg-[#151823] border-white/10 text-white"
                    placeholder="Digite a senha novamente"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
                  disabled={isRegistering || isProcessing}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta e aceitar convite'
                  )}
                </Button>
              </form>
            )}

            <div className="text-center pt-4">
              <p className="text-xs text-slate-400">
                Ao criar sua conta, você aceita automaticamente o convite e será direcionado para completar seu perfil.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
