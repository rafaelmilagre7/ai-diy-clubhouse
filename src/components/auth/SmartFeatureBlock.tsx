
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield, ArrowRight, Eye, AlertTriangle, Clock, Star } from 'lucide-react';
import { APP_FEATURES } from '@/config/features';

interface SmartFeatureBlockProps {
  feature: string;
  blockReason: 'insufficient_role' | 'incomplete_setup' | 'feature_disabled' | 'none';
  hasRoleAccess: boolean;
  setupComplete: boolean;
  showPreview?: boolean;
}

// REMOVIDO: Configuração implementation_trail (Fase 5.1 - Limpeza Final)
const FEATURE_CONFIG = {
  learning: {
    title: 'Área de Aprendizado',
    description: 'Cursos e aulas personalizadas para seu nível e objetivos',
    icon: Star,
    color: 'bg-purple-500',
    preview: 'Acesse cursos curados e aulas direcionadas ao seu setor e nível de conhecimento em IA.',
    benefits: [
      'Cursos curados por especialistas',
      'Aulas direcionadas ao seu setor',
      'Conteúdo adaptado ao seu nível',
      'Certificados de conclusão'
    ]
  }
};

export const SmartFeatureBlock: React.FC<SmartFeatureBlockProps> = ({
  feature,
  blockReason,
  hasRoleAccess,
  setupComplete,
  showPreview = true
}) => {
  const navigate = useNavigate();
  const config = FEATURE_CONFIG[feature] || FEATURE_CONFIG.learning;
  const Icon = config.icon;

  const handleAction = () => {
    navigate('/dashboard');
  };

  const getActionText = () => {
    return 'Voltar ao Dashboard';
  };

  const getBlockMessage = () => {
    if (blockReason === 'feature_disabled') {
      const featureConfig = APP_FEATURES[feature as keyof typeof APP_FEATURES];
      return {
        title: 'Funcionalidade Temporariamente Indisponível',
        description: featureConfig 
          ? 'Esta funcionalidade está sendo aprimorada e será reativada em breve. Fique atento às novidades!'
          : 'Esta funcionalidade não está disponível no momento.',
        variant: 'default' as const,
        icon: Clock,
        actionMessage: 'Enquanto isso, explore outras funcionalidades disponíveis no dashboard.'
      };
    }
    
    return {
      title: 'Acesso Premium Necessário',
      description: 'Esta é uma funcionalidade premium exclusiva para membros selecionados.',
      variant: 'secondary' as const,
      icon: Star,
      actionMessage: 'Explore outras funcionalidades incríveis disponíveis para você.'
    };
  };

  const blockInfo = getBlockMessage();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${config.color} bg-opacity-10`}>
              <Icon className={`h-8 w-8 text-gray-600 dark:text-gray-300`} />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-3 text-xl">
            {config.title}
            <blockInfo.icon className="h-5 w-5 text-gray-500" />
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{config.description}</p>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            <Badge 
              variant={blockInfo.variant}
              className="gap-2 px-4 py-2 text-sm"
            >
              <blockInfo.icon className="h-4 w-4" />
              {blockInfo.title}
            </Badge>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {blockInfo.description}
            </p>
            {blockInfo.actionMessage && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {blockInfo.actionMessage}
              </p>
            )}
          </div>

          {showPreview && blockReason !== 'feature_disabled' && config.benefits && (
            <div className="mt-6 p-6 bg-gradient-to-br from-viverblue/5 to-purple-500/5 rounded-lg border border-viverblue/20">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-viverblue" />
                <span className="text-lg font-semibold text-viverblue">O que você perderia</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {config.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-viverblue mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded border">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  "{config.preview}"
                </p>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={handleAction}
              className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
              size="lg"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              {getActionText()}
            </Button>
          </div>
        </CardContent>
      </Card>

      {blockReason === 'feature_disabled' && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Status: Em Desenvolvimento</span>
            </div>
            <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
              Estamos trabalhando para tornar esta funcionalidade ainda melhor. Aguarde novidades!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
