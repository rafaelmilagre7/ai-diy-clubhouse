
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCheck, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { logger } from '@/utils/logger';

interface InviteRegisterFormProps {
  email: string;
  initialName?: string;
  token: string;
  onUserExists: () => void;
}

const InviteRegisterForm = ({ 
  email, 
  initialName, 
  token, 
  onUserExists 
}: InviteRegisterFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: initialName || '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Limpar erro ao digitar
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      logger.info('[INVITE-REGISTER] 🚀 Iniciando registro via convite', {
        email,
        hasName: !!formData.name,
        token: token.substring(0, 8) + '***'
      });

      // Tentar registrar o usuário
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            invite_token: token
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          logger.warn('[INVITE-REGISTER] ⚠️ Usuário já existe', { email });
          onUserExists();
          return;
        }
        throw signUpError;
      }

      if (data.user) {
        logger.info('[INVITE-REGISTER] ✅ Registro bem-sucedido', {
          userId: data.user.id.substring(0, 8) + '***'
        });

        // Manter token para onboarding
        InviteTokenManager.storeToken(token);
        
        // Redirecionar para onboarding
        navigate(`/onboarding?token=${token}&invite=true`, { replace: true });
      }

    } catch (err: any) {
      logger.error('[INVITE-REGISTER] ❌ Erro no registro', err);
      setError(err.message || 'Erro no cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
            <UserCheck className="w-8 h-8 text-viverblue" />
          </div>
          <CardTitle className="text-2xl text-white">
            Complete seu Cadastro
          </CardTitle>
          <div className="text-neutral-300 text-sm">
            Você foi convidado para se juntar à nossa plataforma com o e-mail{' '}
            <strong className="text-viverblue">{email}</strong>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="pl-10 bg-neutral-800/50 border-white/20 text-neutral-300"
                />
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10 bg-[#0F111A]/50 border-white/20 text-white placeholder:text-neutral-400"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10 bg-[#0F111A]/50 border-white/20 text-white placeholder:text-neutral-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10 bg-[#0F111A]/50 border-white/20 text-white placeholder:text-neutral-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Botão de Cadastro */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
            >
              {isLoading ? 'Criando conta...' : 'Aceitar convite e criar conta'}
            </Button>

            {/* Link para login */}
            <div className="text-center text-sm text-neutral-400">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => navigate(`/login?invite=true&token=${token}`)}
                className="text-viverblue hover:underline"
              >
                Fazer login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteRegisterForm;
