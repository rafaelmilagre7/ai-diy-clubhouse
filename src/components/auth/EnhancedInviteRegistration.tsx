
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DynamicBrandLogo } from '@/components/common/DynamicBrandLogo';
import { getBrandColors } from '@/services/brandLogoService';

export const EnhancedInviteRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { signUp } = useAuth();
  
  const { inviteDetails, loading: inviteLoading, error: inviteError } = useInviteDetails(token || undefined);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detectar tipo de usuário baseado no role do convite
  const userType = inviteDetails?.role?.name === 'formacao' ? 'formacao' : 'club';
  const brandColors = getBrandColors(userType);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteDetails) {
      toast.error('Convite inválido');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setIsSubmitting(true);

      // Registrar usuário
      const { error: signUpError } = await signUp(
        inviteDetails.email,
        formData.password,
        {
          name: formData.name,
          invited_by: inviteDetails.created_by,
          invite_token: token
        }
      );

      if (signUpError) {
        toast.error(`Erro no registro: ${signUpError.message}`);
        return;
      }

      // Marcar convite como usado
      const { error: inviteUpdateError } = await supabase
        .from('invites')
        .update({ 
          used_at: new Date().toISOString(),
          used_by: inviteDetails.email
        })
        .eq('token', token);

      if (inviteUpdateError) {
        console.error('Erro ao marcar convite como usado:', inviteUpdateError);
      }

      toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
      navigate('/login');

    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast.error('Erro interno. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (inviteLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-lg border-0">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteError || !inviteDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-lg border-0">
          <CardContent className="text-center p-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Convite Inválido</h2>
            <p className="text-gray-600 mb-6">
              {inviteError || 'Este convite não é válido ou já foi utilizado.'}
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full"
              variant="outline"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Section */}
        <div className="text-center">
          <DynamicBrandLogo
            userType={userType}
            className="mx-auto h-40 w-auto mb-6"
            alt={`Logo ${userType === 'club' ? 'VIVER DE IA Club' : 'FORMAÇÃO VIVER DE IA'}`}
          />
        </div>

        {/* Welcome Card */}
        <Card className="bg-white shadow-xl border-0 overflow-hidden">
          <div className={`h-1 ${brandColors.bg}`} />
          
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo!
            </CardTitle>
            <p className="text-gray-600">
              Você foi convidado para se juntar ao{' '}
              <span className={`font-semibold ${brandColors.text}`}>
                {userType === 'club' ? 'VIVER DE IA Club' : 'FORMAÇÃO VIVER DE IA'}
              </span>
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {/* Invite Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{inviteDetails.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 mt-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>Role: {inviteDetails.role.name}</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 bg-white border-gray-200 focus:border-gray-400 focus:ring-0"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 bg-white border-gray-200 focus:border-gray-400 focus:ring-0"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 bg-white border-gray-200 focus:border-gray-400 focus:ring-0"
                  placeholder="Digite a senha novamente"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-11 font-medium ${brandColors.bg} ${brandColors.bgHover} text-white`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Já tem uma conta?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className={`font-medium ${brandColors.text} ${brandColors.hover} transition-colors`}
                >
                  Fazer login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Ao criar uma conta, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInviteRegistration;
