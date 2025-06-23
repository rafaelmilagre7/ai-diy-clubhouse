
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { auditLogger } from '@/utils/auditLogger';
import { logger } from '@/utils/logger';
import AuthLayout from './AuthLayout';

interface ValidationResult {
  valid: boolean;
  message: string;
  error?: string;
  invite_data?: any;
}

const InviteAcceptPage = () => {
  const { token: paramToken } = useParams();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  // FONTE ÚNICA DE TOKEN - suporta tanto /convite/:token quanto /invite/:token
  const inviteToken = paramToken || InviteTokenManager.getToken();

  useEffect(() => {
    const validateInvite = async () => {
      setIsChecking(true);
      try {
        if (!inviteToken) {
          setValidationResult({
            valid: false,
            message: 'Nenhum convite detectado. Verifique o link ou insira o token manualmente.'
          });
          return;
        }

        const { data, error } = await supabase.rpc('validate_user_invite_match', {
          p_token: inviteToken
        });

        if (error) {
          logger.error('Erro ao validar convite', {
            component: 'InviteAcceptPage',
            error: error.message,
            inviteToken
          });
          
          await auditLogger.logInviteProcess('invite_validation_failed', inviteToken, {
            error: error.message
          });

          setValidationResult({
            valid: false,
            message: 'Erro ao validar o convite. Tente novamente mais tarde.',
            error: error.message
          });
          return;
        }

        if (data?.valid === true) {
          logger.info('Convite válido', {
            component: 'InviteAcceptPage',
            inviteToken
          });
          
          await auditLogger.logInviteProcess('invite_validation_success', inviteToken);

          setValidationResult({
            valid: true,
            message: 'Convite válido. Complete seu registro abaixo!',
            invite_data: data.invite_data
          });
        } else {
          logger.warn('Convite inválido', {
            component: 'InviteAcceptPage',
            inviteToken,
            error: data?.error,
            message: data?.message
          });
          
          await auditLogger.logInviteProcess('invite_validation_invalid', inviteToken, {
            error: data?.error,
            message: data?.message
          });

          setValidationResult({
            valid: false,
            message: data?.message || 'Convite inválido. Verifique o link ou insira o token manualmente.',
            error: data?.error
          });
        }

      } catch (err: any) {
        logger.error('Erro inesperado ao validar convite', {
          component: 'InviteAcceptPage',
          error: err.message,
          inviteToken
        });
        
        await auditLogger.logInviteProcess('invite_validation_error', inviteToken, {
          error: err.message
        });

        setValidationResult({
          valid: false,
          message: 'Erro inesperado ao validar o convite.',
          error: err.message
        });
      } finally {
        setIsChecking(false);
      }
    };

    validateInvite();
  }, [inviteToken, navigate]);

  const handleRegistrationSuccess = () => {
    setRegistrationSuccess(true);
    
    // Limpar o token após o registro bem-sucedido
    InviteTokenManager.clearToken();

    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Aceitar Convite</CardTitle>
          <CardDescription>
            {isChecking && 'Validando convite...'}
            {validationResult && validationResult.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isChecking ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : validationResult ? (
            validationResult.valid ? (
              <>
                {registrationSuccess ? (
                  <Alert variant="success">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Registro completo! Redirecionando para o painel...
                    </AlertDescription>
                  </Alert>
                ) : (
                  <RegisterForm
                    inviteToken={inviteToken}
                    onSuccess={handleRegistrationSuccess}
                    defaultEmail={validationResult.invite_data?.email}
                  />
                )}
              </>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationResult.message}
                  {validationResult.error && ` (${validationResult.error})`}
                  <div className="mt-2">
                    <Button size="sm" onClick={() => navigate('/register')}>
                      Tentar se registrar sem o convite
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )
          ) : null}
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default InviteAcceptPage;
