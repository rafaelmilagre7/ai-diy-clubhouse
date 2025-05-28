
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, Users, Target, ArrowRight, Eye } from 'lucide-react';

interface SmartFeatureBlockProps {
  feature: string;
  blockReason: 'insufficient_role' | 'incomplete_onboarding' | 'none';
  hasRoleAccess: boolean;
  onboardingComplete: boolean;
  showPreview?: boolean;
}

const FEATURE_CONFIG = {
  networking: {
    title: 'Networking Inteligente',
    description: 'Conecte-se com outros empreendedores através de matchmaking personalizado com IA',
    icon: Users,
    color: 'bg-blue-500',
    preview: 'Receba 5 indicações mensais de potenciais clientes e 3 de fornecedores, selecionados pela nossa IA baseado no seu perfil e objetivos de negócio.'
  },
  implementation_trail: {
    title: 'Trilha de Implementação',
    description: 'Sua jornada personalizada de implementação de IA baseada no seu perfil',
    icon: Target,
    color: 'bg-viverblue',
    preview: 'Receba recomendações personalizadas de soluções e cursos, criadas especificamente para seus objetivos e experiência com IA.'
  },
  learning: {
    title: 'Área de Aprendizado',
    description: 'Cursos e aulas personalizadas para seu nível e objetivos',
    icon: Sparkles,
    color: 'bg-purple-500',
    preview: 'Acesse cursos curados e aulas direcionadas ao seu setor e nível de conhecimento em IA.'
  }
};

export const SmartFeatureBlock: React.FC<SmartFeatureBlockProps> = ({
  feature,
  blockReason,
  hasRoleAccess,
  onboardingComplete,
  showPreview = true
}) => {
  const navigate = useNavigate();
  const config = FEATURE_CONFIG[feature] || FEATURE_CONFIG.networking;
  const Icon = config.icon;

  const handleAction = () => {
    if (blockReason === 'incomplete_onboarding') {
      navigate('/onboarding-new');
    } else {
      // Para roles insuficientes, pode direcionar para upgrade ou contato
      navigate('/dashboard');
    }
  };

  const getActionText = () => {
    if (blockReason === 'incomplete_onboarding') {
      return 'Completar Onboarding';
    }
    return 'Saiba Mais';
  };

  const getBlockMessage = () => {
    if (blockReason === 'incomplete_onboarding') {
      return {
        title: 'Complete seu Onboarding',
        description: 'Para personalizar sua experiência e desbloquear todas as funcionalidades, complete primeiro seu onboarding.',
        variant: 'warning' as const
      };
    }
    
    return {
      title: 'Acesso Restrito',
      description: 'Esta funcionalidade não está disponível para seu tipo de conta atual.',
      variant: 'error' as const
    };
  };

  const blockInfo = getBlockMessage();

  return (
    <div className="space-y-6">
      {/* Cabeçalho da funcionalidade */}
      <Card className="border-2 border-dashed">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${config.color} bg-opacity-10`}>
              <Icon className={`h-8 w-8 text-white`} />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            {config.title}
            <Lock className="h-4 w-4 text-gray-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">{config.description}</p>
          
          {/* Status de bloqueio */}
          <div className="flex justify-center">
            <Badge 
              variant={blockInfo.variant === 'warning' ? 'secondary' : 'destructive'}
              className="gap-2"
            >
              <Lock className="h-3 w-3" />
              {blockInfo.title}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-400">
            {blockInfo.description}
          </p>

          {/* Preview da funcionalidade */}
          {showPreview && (
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-viverblue" />
                <span className="text-sm font-medium text-viverblue">Preview</span>
              </div>
              <p className="text-sm text-gray-300">
                {config.preview}
              </p>
            </div>
          )}

          {/* Status do onboarding */}
          {hasRoleAccess && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status do Onboarding</p>
                  <p className="text-xs text-gray-400">
                    {onboardingComplete ? 'Completo ✅' : 'Pendente ⏳'}
                  </p>
                </div>
                {!onboardingComplete && (
                  <Button
                    onClick={handleAction}
                    size="sm"
                    className="bg-viverblue hover:bg-viverblue/90"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {getActionText()}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Botão de ação principal */}
          {!onboardingComplete && hasRoleAccess && (
            <Button
              onClick={handleAction}
              className="w-full bg-viverblue hover:bg-viverblue/90"
              size="lg"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              {getActionText()}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
