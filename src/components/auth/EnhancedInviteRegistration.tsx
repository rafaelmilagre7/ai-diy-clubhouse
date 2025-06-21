
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { DynamicBrandLogo } from '@/components/common/DynamicBrandLogo';
import { detectUserType, getBrandColors } from '@/services/brandLogoService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnhancedInviteRegistrationProps {
  inviteToken: string;
  inviteEmail: string;
  inviteRole?: string;
  onSuccess: () => void;
}

const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({
  inviteToken,
  inviteEmail,
  inviteRole,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { inviteDetails, loading: inviteLoading } = useInviteDetails(inviteToken);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detectar tipo de usuário para personalização
  const userType = detectUserType({
    inviteRole: inviteRole || inviteDetails?.role?.name,
    defaultType: 'club'
  });
  
  const brandColors = getBrandColors(userType);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
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
    
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🔄 [INVITE-REGISTRATION] Iniciando registro via convite');

      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteEmail,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: formData.name,
            invite_token: inviteToken
          }
        }
      });

      if (authError) {
        console.error('❌ [INVITE-REGISTRATION] Erro na criação da conta:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Falha na criação do usuário');
      }

      console.log('✅ [INVITE-REGISTRATION] Conta criada:', authData.user.id);

      // 2. Marcar convite como usado
      const { error: inviteError } = await supabase
        .from('invites')
        .update({ 
          used_at: new Date().toISOString(),
          used_by: authData.user.id
        })
        .eq('token', inviteToken);

      if (inviteError) {
        console.error('⚠️ [INVITE-REGISTRATION] Erro ao marcar convite como usado:', inviteError);
      }

      // 3. Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: inviteEmail,
          name: formData.name,
          role_id: inviteDetails?.role?.id || null,
          role: inviteDetails?.role?.name || 'member',
          onboarding_completed: false,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('⚠️ [INVITE-REGISTRATION] Erro ao criar perfil:', profileError);
      }

      toast.success('Conta criada com sucesso! Bem-vindo!');
      console.log('✅ [INVITE-REGISTRATION] Registro concluído com sucesso');
      
      onSuccess();

    } catch (error: any) {
      console.error('❌ [INVITE-REGISTRATION] Erro no registro:', error);
      setError(error.message || 'Erro ao criar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-center text-gray-600">Validando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <DynamicBrandLogo 
              userType={userType}
              className="mx-auto h-16 w-auto"
              alt={`Logo ${userType === 'club' ? 'VIVER DE IA Club' : 'FORMAÇÃO VIVER DE IA'}`}
            />
            
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Criar sua conta
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Você foi convidado para {userType === 'club' ? 'VIVER DE IA Club' : 'FORMAÇÃO VIVER DE IA'}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Convite válido para: <strong>{inviteEmail}</strong>
                </span>
              </div>
              {inviteDetails?.role && (
                <p className="text-xs text-green-700 mt-1">
                  Papel: {inviteDetails.role.name}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite seu nome completo"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  disabled
                  className="bg-gray-50 text-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Crie uma senha (mín. 6 caracteres)"
                    required
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
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
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
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className={`w-full ${brandColors.bg} ${brandColors.bgHover} text-white`}
                disabled={isSubmitting}
              >
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

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Button
                  variant="link"
                  className={`p-0 h-auto ${brandColors.text} ${brandColors.hover}`}
                  onClick={() => navigate('/auth')}
                  disabled={isSubmitting}
                >
                  Fazer login
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedInviteRegistration;
