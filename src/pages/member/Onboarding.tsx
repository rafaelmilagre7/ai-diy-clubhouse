
import React from 'react';
import { OnboardingBypass } from '@/components/onboarding/OnboardingBypass';
import { useOnboardingLogic } from '@/hooks/onboarding/useOnboardingLogic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Users, Zap } from 'lucide-react';

/**
 * Página de Onboarding - FASE 2
 * Integração com design da plataforma + sistema de bypass
 */
const OnboardingContent: React.FC = () => {
  const { isLoading, user, profile, isAdmin, isMasterAdmin } = useOnboardingLogic();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Bem-vindo à Plataforma! 🚀
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Vamos configurar sua experiência para extrair o máximo valor da plataforma
        </p>
      </div>

      {/* Status do usuário */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Status do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {isMasterAdmin && <Badge variant="default" className="bg-purple-600">Master Admin</Badge>}
            {isAdmin && <Badge variant="default" className="bg-blue-600">Admin</Badge>}
            <Badge variant="outline">
              {profile?.role || 'Membro'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Email: {user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Membro desde: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Acesso: {isAdmin ? 'Total' : 'Padrão'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progresso do Onboarding */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso da Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">✅ Fase 2 Implementada</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Design integrado com MemberLayout</li>
                <li>• Sistema de bypass inteligente ativo</li>
                <li>• Proteção total para usuários existentes</li>
                <li>• Zero impacto na experiência atual</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">⏳ Próximas Fases</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Coleta de dados de configuração</li>
                <li>• Personalização da experiência</li>
                <li>• Integração com ferramentas favoritas</li>
                <li>• Tutorial interativo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>O que você gostaria de fazer?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="h-16 text-left justify-start"
              variant="outline"
            >
              <div>
                <div className="font-medium">Ir para Dashboard</div>
                <div className="text-sm text-gray-500">Continuar usando a plataforma</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/solutions'}
              className="h-16 text-left justify-start"
              variant="outline"
            >
              <div>
                <div className="font-medium">Explorar Soluções</div>
                <div className="text-sm text-gray-500">Descobrir implementações disponíveis</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info (apenas para admins) */}
      {isAdmin && (
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info (Admin)</CardTitle>
          </CardHeader>
          <CardContent className="text-xs font-mono">
            <div className="space-y-1">
              <div>User ID: {user?.id}</div>
              <div>Email: {user?.email}</div>
              <div>Role: {profile?.role}</div>
              <div>Is Admin: {isAdmin ? 'Yes' : 'No'}</div>
              <div>Is Master Admin: {isMasterAdmin ? 'Yes' : 'No'}</div>
              <div>Created: {profile?.created_at}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Onboarding: React.FC = () => {
  return (
    <OnboardingBypass>
      <OnboardingContent />
    </OnboardingBypass>
  );
};

export default Onboarding;
