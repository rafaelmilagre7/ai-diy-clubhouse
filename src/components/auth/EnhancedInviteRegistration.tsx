
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Eye, EyeOff, User, Mail, Lock, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import LoadingScreen from '@/components/common/LoadingScreen';

interface EnhancedInviteRegistrationProps {
  token?: string;
}

export const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({ token }) => {
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const { inviteDetails, loading: inviteLoading, error: inviteError } = useInviteDetails(token);
  const { acceptInvite } = useInviteFlow();

  const [step, setStep] = useState<'loading' | 'registration' | 'processing' | 'success'>('loading');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    jobTitle: ''
  });

  // Verificar se usuário já está logado
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Processar detalhes do convite
  useEffect(() => {
    if (!inviteLoading) {
      if (inviteError || !inviteDetails) {
        setError(inviteError || 'Convite não encontrado ou expirado');
        setStep('registration');
      } else {
        setFormData(prev => ({
          ...prev,
          email: inviteDetails.email
        }));
        setStep('registration');
      }
    }
  }, [inviteLoading, inviteError, inviteDetails]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    if (!formData.password) {
      setError('Senha é obrigatória');
      return false;
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!inviteDetails) {
      setError('Detalhes do convite não encontrados');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setStep('processing');

    try {
      console.log('[ENHANCED-INVITE-REGISTRATION] Iniciando registro com dados completos:', {
        email: formData.email,
        name: formData.name,
        company: formData.company,
        jobTitle: formData.jobTitle,
        inviteToken: token
      });

      // Criar conta com dados expandidos
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          name: formData.name,
          company: formData.company || undefined,
          job_title: formData.jobTitle || undefined,
          invite_token: token,
          // Marcar que dados básicos foram coletados
          basic_info_completed: true
        }
      );

      if (signUpError) {
        console.error('[ENHANCED-INVITE-REGISTRATION] Erro no registro:', signUpError);
        setError(signUpError.message === 'User already registered' 
          ? 'Este email já está cadastrado. Tente fazer login.'
          : `Erro no registro: ${signUpError.message}`
        );
        setStep('registration');
        return;
      }

      // Aceitar convite automaticamente após registro
      if (token) {
        console.log('[ENHANCED-INVITE-REGISTRATION] Aplicando convite automaticamente');
        const result = await acceptInvite(token);
        
        if (!result.success) {
          console.warn('[ENHANCED-INVITE-REGISTRATION] Falha ao aplicar convite:', result.message);
          // Não bloquear o fluxo por isso
        }
      }

      setStep('success');
      
      // Redirecionar após sucesso
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('[ENHANCED-INVITE-REGISTRATION] Erro inesperado:', err);
      setError('Erro inesperado durante o registro');
      setStep('registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    if (error) setError('');
  };

  if (step === 'loading' || inviteLoading) {
    return <LoadingScreen message="Validando seu convite..." />;
  }

  if (step === 'processing') {
    return <LoadingScreen message="Criando sua conta..." />;
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F111A] to-[#151823] p-4">
        <Card className="w-full max-w-md glass-dark border-green-500/30">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Conta criada com sucesso!</h2>
            <p className="text-neutral-300 mb-4">
              Bem-vindo à Viver de IA! Redirecionando para seu dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F111A] to-[#151823] p-4">
      <Card className="w-full max-w-lg glass-dark border-viverblue/30">
        <CardHeader className="text-center pb-6">
          <div className="mb-4">
            <div className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-viverblue" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Complete seu Registro
          </CardTitle>
          <p className="text-neutral-300 mt-2">
            {inviteDetails ? (
              <>Você foi convidado para <span className="text-viverblue font-semibold">{inviteDetails.role.name}</span></>
            ) : (
              'Complete suas informações para acessar a plataforma'
            )}
          </p>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome completo */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-200 flex items-center gap-2">
                <User className="h-4 w-4 text-viverblue" />
                Nome completo *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="Seu nome completo"
                required
                className="bg-[#1A1E2E] border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-200 flex items-center gap-2">
                <Mail className="h-4 w-4 text-viverblue" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="seu@email.com"
                required
                disabled={!!inviteDetails?.email}
                className="bg-[#1A1E2E] border-neutral-700 text-white placeholder:text-neutral-500 disabled:opacity-60"
              />
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-neutral-200 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-viverblue" />
                Empresa/Organização
              </Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={handleInputChange('company')}
                placeholder="Nome da sua empresa"
                className="bg-[#1A1E2E] border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-neutral-200 flex items-center gap-2">
                <User className="h-4 w-4 text-viverblue" />
                Cargo/Função
              </Label>
              <Input
                id="jobTitle"
                type="text"
                value={formData.jobTitle}
                onChange={handleInputChange('jobTitle')}
                placeholder="Seu cargo atual"
                className="bg-[#1A1E2E] border-neutral-700 text-white placeholder:text-neutral-500"
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-200 flex items-center gap-2">
                <Lock className="h-4 w-4 text-viverblue" />
                Senha *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="bg-[#1A1E2E] border-neutral-700 text-white placeholder:text-neutral-500 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-neutral-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Confirmar senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-neutral-200 flex items-center gap-2">
                <Lock className="h-4 w-4 text-viverblue" />
                Confirmar senha *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  placeholder="Digite a senha novamente"
                  required
                  className="bg-[#1A1E2E] border-neutral-700 text-white placeholder:text-neutral-500 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-neutral-400 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-semibold py-3 mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta e acessar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-400">
              Já tem uma conta?{' '}
              <Button
                variant="link"
                className="text-viverblue hover:text-viverblue-light p-0 h-auto"
                onClick={() => navigate('/login')}
              >
                Fazer login
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedInviteRegistration;
