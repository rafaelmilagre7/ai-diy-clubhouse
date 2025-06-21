
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import EnhancedInviteRegistration from '@/components/auth/EnhancedInviteRegistration';
import { DynamicBrandLogo } from '@/components/common/DynamicBrandLogo';
import { detectUserType, getBrandColors } from '@/services/brandLogoService';
import { supabase } from '@/integrations/supabase/client';

const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    if (token) {
      handleValidateToken();
    }
  }, [token]);

  const handleValidateToken = async () => {
    setIsValidating(true);
    try {
      console.log('🔍 [INVITE-PAGE] Validando token:', token);

      const { data: invite, error } = await supabase
        .from('invites')
        .select(`
          *,
          user_roles:role_id (
            id,
            name,
            description
          )
        `)
        .eq('token', token)
        .single();

      if (error || !invite) {
        console.error('❌ [INVITE-PAGE] Token não encontrado:', error);
        setValidationResult({
          isValid: false,
          error: 'Token de convite não encontrado ou inválido'
        });
        setIsValidating(false);
        return;
      }

      // Verificar se já foi usado
      if (invite.used_at) {
        setValidationResult({
          isValid: false,
          error: 'Este convite já foi utilizado'
        });
        setIsValidating(false);
        return;
      }

      // Verificar se expirou
      if (new Date(invite.expires_at) < new Date()) {
        setValidationResult({
          isValid: false,
          error: 'Este convite expirou'
        });
        setIsValidating(false);
        return;
      }

      console.log('✅ [INVITE-PAGE] Token válido:', invite);
      setValidationResult({
        isValid: true,
        invite: {
          ...invite,
          role: invite.user_roles
        }
      });

    } catch (error: any) {
      console.error('❌ [INVITE-PAGE] Erro na validação:', error);
      setValidationResult({
        isValid: false,
        error: 'Erro ao validar convite'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRegistrationSuccess = () => {
    console.log('✅ [INVITE-PAGE] Registro bem-sucedido, redirecionando para onboarding');
    navigate('/onboarding');
  };

  // Detectar tipo de usuário para personalização
  const userType = detectUserType({
    inviteRole: validationResult?.invite?.role?.name,
    defaultType: 'club'
  });

  const brandColors = getBrandColors(userType);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <DynamicBrandLogo 
                userType={userType}
                className="mx-auto h-16 w-auto"
              />
              <Loader2 className={`h-8 w-8 animate-spin ${brandColors.text}`} />
              <p className="text-center text-gray-600">Validando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validationResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center">
            <DynamicBrandLogo 
              userType={userType}
              className="mx-auto h-16 w-auto mb-4"
            />
            <CardTitle className="flex items-center justify-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Token não encontrado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Token de convite não encontrado
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
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

  if (!validationResult.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center">
            <DynamicBrandLogo 
              userType={userType}
              className="mx-auto h-16 w-auto mb-4"
            />
            <CardTitle className="flex items-center justify-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Convite Inválido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {validationResult.error}
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
              variant="outline"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se usuário já está logado, verificar se precisa fazer onboarding
  if (user && user.email === validationResult.invite?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center">
            <DynamicBrandLogo 
              userType={userType}
              className="mx-auto h-16 w-auto mb-4"
            />
            <CardTitle className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Bem-vindo!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Você já está logado. Vamos verificar seu perfil.
            </p>
            <Button 
              onClick={() => navigate('/onboarding')} 
              className={`w-full ${brandColors.bg} ${brandColors.bgHover} text-white`}
            >
              Continuar para Plataforma
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (validationResult.invite && !user) {
    return (
      <EnhancedInviteRegistration
        inviteToken={token!}
        inviteEmail={validationResult.invite.email}
        inviteRole={validationResult.invite.role?.name}
        onSuccess={handleRegistrationSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center">
          <DynamicBrandLogo 
            userType={userType}
            className="mx-auto h-16 w-auto mb-4"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
            <p className="text-center text-gray-600">Estado inesperado do convite</p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
              variant="outline"
            >
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;
