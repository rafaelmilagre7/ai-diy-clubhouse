
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInviteFlow } from '@/hooks/useInviteFlow';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, Mail, Calendar, Clock, CheckCircle } from 'lucide-react';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import LoadingScreen from '@/components/common/LoadingScreen';
import { logger } from '@/utils/logger';

const InviteAcceptPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSimpleAuth();
  
  // Token management - fonte única de verdade
  const urlToken = searchParams.get('token');
  const storedToken = InviteTokenManager.getToken();
  const inviteToken = urlToken || storedToken;

  // CORRIGIDO: Usar apenas os campos que existem no hook
  const { inviteDetails, isLoading, error } = useInviteFlow(inviteToken || undefined);
  
  const [isAccepting, setIsAccepting] = useState(false);

  // Store token if found in URL
  useEffect(() => {
    if (urlToken) {
      InviteTokenManager.storeToken(urlToken);
    }
  }, [urlToken]);

  // Auto-redirect se já estiver logado
  useEffect(() => {
    if (user && inviteDetails) {
      logger.info('[INVITE-ACCEPT] Usuário já logado, redirecionando para onboarding');
      navigate(`/onboarding?token=${inviteToken}`, { replace: true });
    }
  }, [user, inviteDetails, inviteToken, navigate]);

  const handleAcceptInvite = async () => {
    if (!inviteToken) return;
    
    setIsAccepting(true);
    try {
      // Armazenar token e redirecionar para onboarding
      InviteTokenManager.storeToken(inviteToken);
      navigate(`/onboarding?token=${inviteToken}`, { replace: true });
    } catch (error) {
      logger.error('[INVITE-ACCEPT] Erro ao aceitar convite:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleLoginRedirect = () => {
    if (inviteToken) {
      InviteTokenManager.storeToken(inviteToken);
    }
    navigate('/auth', { state: { hasInvite: true } });
  };

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Validando convite..." />;
  }

  // Error state
  if (error || !inviteDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1A1E2E] border-neutral-800">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400">Convite Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-neutral-300">
              {error || 'Este convite não é válido ou pode ter expirado.'}
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // CORRIGIDO: role agora é um objeto com id e name
  const roleDisplayName = inviteDetails.role.name === 'formacao' ? 'Formação' : 
                          inviteDetails.role.name === 'admin' ? 'Administrador' : 'Membro Club';
  
  const roleDescription = inviteDetails.role.name === 'formacao' 
    ? 'Acesso para criar cursos e conteúdos educacionais'
    : inviteDetails.role.name === 'admin'
    ? 'Acesso administrativo completo à plataforma'
    : 'Acesso aos cursos, soluções e comunidade';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-[#1A1E2E] border-neutral-800">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-viverblue" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">Você foi convidado!</CardTitle>
            <p className="text-neutral-400 mt-2">
              Bem-vindo ao Viver de IA Club
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Detalhes do Convite */}
          <div className="space-y-4 p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-viverblue" />
              <div>
                <p className="text-sm text-neutral-400">Email</p>
                <p className="text-white font-medium">{inviteDetails.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-viverblue" />
              <div>
                <p className="text-sm text-neutral-400">Tipo de Acesso</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-viverblue/20 text-viverblue">
                    {roleDisplayName}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {roleDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-viverblue" />
              <div>
                <p className="text-sm text-neutral-400">Validade</p>
                <p className="text-white text-sm">
                  {new Date(inviteDetails.expires_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-3">
            <Button 
              onClick={handleAcceptInvite}
              disabled={isAccepting}
              className="w-full bg-viverblue hover:bg-viverblue/90 text-black font-semibold"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aceitar Convite
                </>
              )}
            </Button>

            {user ? (
              <p className="text-center text-sm text-neutral-400">
                Você será redirecionado para completar seu perfil
              </p>
            ) : (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handleLoginRedirect}
                  className="w-full border-neutral-700 hover:bg-neutral-800"
                >
                  Já tenho conta - Fazer Login
                </Button>
                <p className="text-center text-xs text-neutral-500">
                  Caso já tenha uma conta, faça login primeiro
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAcceptPage;
