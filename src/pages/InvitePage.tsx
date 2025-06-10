
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useInviteValidation } from '@/hooks/admin/invites/useInviteValidation';
import RegisterForm from '@/components/auth/RegisterForm';

const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { validationState, validateToken } = useInviteValidation();
  
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    if (token) {
      handleValidateToken();
    }
  }, [token]);

  const handleValidateToken = async () => {
    if (!token) return;
    
    try {
      const result = await validateToken(token, user?.email);
      setValidationResult(result);
      
      if (result.isValid && !user) {
        setShowRegisterForm(true);
      }
    } catch (error) {
      console.error('Erro na validação:', error);
    }
  };

  const handleLogout = () => {
    // Implementar logout se necessário
    window.location.href = '/auth';
  };

  if (validationState.isValidating) {
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
            
            {validationResult.needsLogout && (
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Fazer Logout e Tentar Novamente
              </Button>
            )}
            
            {validationResult.suggestions && validationResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Sugestões:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {validationResult.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
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
