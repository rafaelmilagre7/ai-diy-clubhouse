
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { supabase } from '@/integrations/supabase/client';

const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

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
        .select('*')
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
        invite: invite
      });

      // Se não está logado, mostrar formulário de registro
      if (!user) {
        setShowRegisterForm(true);
      }

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

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
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

  if (!validationResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <p className="text-center text-gray-600">Token de convite não encontrado</p>
              <Button onClick={() => navigate('/auth')}>
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validationResult.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
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
            
            <Button onClick={() => navigate('/auth')} className="w-full">
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user && user.email === validationResult.invite?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Bem-vindo!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Você já está logado e pode acessar a plataforma.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Ir para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showRegisterForm && validationResult.invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Criar Conta</CardTitle>
                <p className="text-center text-sm text-gray-600">
                  Convite para: {validationResult.invite.email}
                </p>
              </CardHeader>
              <CardContent>
                <RegisterForm 
                  inviteToken={token}
                  prefilledEmail={validationResult.invite.email}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <p className="text-center text-gray-600">Estado inesperado do convite</p>
            <Button onClick={() => navigate('/auth')}>
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;
