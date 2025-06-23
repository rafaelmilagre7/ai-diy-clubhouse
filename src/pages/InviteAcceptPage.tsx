
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, UserPlus } from 'lucide-react';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import SimpleRegisterForm from '@/components/auth/SimpleRegisterForm';
import { contrastClasses } from '@/lib/contrastUtils';

const InviteAcceptPage = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  const { inviteDetails, loading, error } = useInviteDetails(inviteToken || undefined);

  if (!inviteToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className={contrastClasses.primary}>
                Token de convite não encontrado
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4" />
            <p className={contrastClasses.secondary}>Verificando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !inviteDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className={contrastClasses.primary}>
                {error || 'Convite inválido ou expirado'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-viverblue" />
          </div>
          
          <div>
            <CardTitle className={`text-2xl font-bold ${contrastClasses.heading}`}>
              Aceitar Convite
            </CardTitle>
            <p className={`mt-2 ${contrastClasses.secondary}`}>
              Você foi convidado para se juntar à plataforma
            </p>
          </div>

          <div className="bg-[#252842]/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-viverblue" />
              <span className={`text-sm font-medium ${contrastClasses.primary}`}>
                Email do convite:
              </span>
            </div>
            <p className={`text-sm ${contrastClasses.secondary}`}>
              {inviteDetails.email}
            </p>
            
            <div className="mt-2">
              <span className={`text-sm font-medium ${contrastClasses.primary}`}>
                Cargo: 
              </span>
              <span className={`ml-2 text-sm px-2 py-1 bg-viverblue/20 text-viverblue rounded ${contrastClasses.primary}`}>
                {inviteDetails.role.name === 'formacao' ? 'Formação' : 'Membro do Clube'}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <SimpleRegisterForm 
            defaultEmail={inviteDetails.email}
            inviteToken={inviteToken}
            onSuccess={() => {
              window.location.href = '/onboarding';
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAcceptPage;
