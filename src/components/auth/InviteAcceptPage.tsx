
import React from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Shield } from 'lucide-react';

const InviteAcceptPage = () => {
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useSimpleAuth();
  
  const inviteToken = searchParams.get('token');
  
  // Se não há token, redirecionar para login
  if (!inviteToken) {
    return <Navigate to="/login" replace />;
  }
  
  // Se usuário já está logado, redirecionar para onboarding
  if (user && !isLoading) {
    InviteTokenManager.storeToken(inviteToken);
    return <Navigate to="/onboarding" replace />;
  }
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
      </div>
    );
  }
  
  const handleAcceptInvite = () => {
    // Armazenar token e redirecionar para onboarding
    InviteTokenManager.storeToken(inviteToken);
    window.location.href = '/onboarding';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-[#1A1E2E] border-gray-800 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-viverblue" />
            </div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Você foi convidado!
            </CardTitle>
            <p className="text-neutral-300 text-sm">
              Aceite seu convite para se juntar ao <strong className="text-viverblue">Viver de IA</strong>
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Informações do convite */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#0F111A] rounded-lg border border-gray-700">
                <Mail className="w-5 h-5 text-viverblue" />
                <div>
                  <p className="text-sm font-medium text-white">Convite Exclusivo</p>
                  <p className="text-xs text-neutral-400">Acesso especial à plataforma</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-[#0F111A] rounded-lg border border-gray-700">
                <Shield className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-white">Seguro e Verificado</p>
                  <p className="text-xs text-neutral-400">Token validado pelo sistema</p>
                </div>
              </div>
            </div>
            
            {/* Botão de aceitar convite */}
            <Button 
              onClick={handleAcceptInvite}
              className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
              size="lg"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Aceitar Convite
            </Button>
            
            {/* Informações adicionais */}
            <div className="text-center space-y-2">
              <p className="text-xs text-neutral-400">
                Ao aceitar, você será direcionado para completar seu cadastro
              </p>
              <p className="text-xs text-neutral-500">
                Token: {inviteToken.substring(0, 8)}***
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteAcceptPage;
