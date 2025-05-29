
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeatureAccess } from '@/hooks/onboarding/useFeatureAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Shield
} from 'lucide-react';

interface SmartFeatureGuardProps {
  children: React.ReactNode;
  feature: string;
  fallbackPath?: string;
  customBlockContent?: React.ReactNode;
}

const FeatureBlockCard: React.FC<{
  feature: string;
  blockReason: string;
  userRole: string | null;
  onRedirect: () => void;
}> = ({ feature, blockReason, userRole, onRedirect }) => {
  const getFeatureConfig = () => {
    switch (feature) {
      case 'networking':
        return {
          title: 'Networking Inteligente',
          description: 'Conecte-se com outros empresários e encontre oportunidades de negócio através de IA',
          benefits: [
            'Matches personalizados baseados no seu perfil',
            'Sugestões de tópicos para conversas',
            'Análise de compatibilidade empresarial',
            'Conexões estratégicas mensais'
          ],
          icon: <Sparkles className="h-8 w-8 text-viverblue" />
        };
      case 'implementation_trail':
        return {
          title: 'Trilha de Implementação',
          description: 'Sua jornada personalizada de IA baseada nos seus objetivos de negócio',
          benefits: [
            'Trilha 100% personalizada para seu negócio',
            'Soluções ordenadas por prioridade',
            'Estimativas de ROI e impacto',
            'Guias passo a passo de implementação'
          ],
          icon: <CheckCircle className="h-8 w-8 text-viverblue" />
        };
      default:
        return {
          title: 'Funcionalidade Premium',
          description: 'Esta funcionalidade está disponível após completar o onboarding',
          benefits: [
            'Acesso a recursos avançados',
            'Experiência personalizada',
            'Suporte especializado'
          ],
          icon: <Lock className="h-8 w-8 text-viverblue" />
        };
    }
  };

  const config = getFeatureConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="bg-viverblue/10 rounded-full p-4 border border-viverblue/20">
              {config.icon}
            </div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-white">
              {config.title}
            </CardTitle>
            <p className="text-gray-300 text-base">
              {config.description}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Razão do bloqueio */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-400" />
              <div>
                <h4 className="font-semibold text-amber-200">
                  {blockReason === 'incomplete_onboarding' 
                    ? 'Complete seu onboarding primeiro'
                    : 'Acesso restrito'
                  }
                </h4>
                <p className="text-sm text-amber-300/80">
                  {blockReason === 'incomplete_onboarding'
                    ? 'Para personalizar sua experiência, precisamos conhecer melhor seu negócio.'
                    : `Seu perfil atual (${userRole}) não tem acesso a esta funcionalidade.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Benefícios */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-viverblue" />
              O que você terá acesso:
            </h4>
            <ul className="space-y-2">
              {config.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Call to Action */}
          <div className="pt-4 border-t border-gray-700">
            <Button 
              onClick={onRedirect}
              className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              size="lg"
            >
              {blockReason === 'incomplete_onboarding' ? (
                <>
                  Completar Onboarding
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Falar com Suporte
                  <Shield className="h-4 w-4" />
                </>
              )}
            </Button>
            
            {blockReason === 'incomplete_onboarding' && (
              <p className="text-center text-sm text-gray-400 mt-3">
                ⏱️ Tempo estimado: 5-10 minutos
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const SmartFeatureGuard: React.FC<SmartFeatureGuardProps> = ({
  children,
  feature,
  fallbackPath = '/onboarding-new',
  customBlockContent
}) => {
  const navigate = useNavigate();
  const { 
    hasAccess, 
    isLoading, 
    error, 
    blockReason, 
    userRole,
    shouldRedirectToOnboarding 
  } = useFeatureAccess({ 
    feature,
    autoCheck: true 
  });

  const handleRedirect = () => {
    if (shouldRedirectToOnboarding()) {
      navigate('/onboarding-new');
    } else {
      // Para outros casos (sem permissão), pode redirecionar para suporte ou dashboard
      navigate('/dashboard');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner size="lg" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-white">
            Verificando permissões...
          </h3>
          <p className="text-gray-400">
            Validando seu acesso à funcionalidade
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-full p-4">
          <Shield className="h-8 w-8 text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-white">
            Erro ao verificar permissões
          </h3>
          <p className="text-gray-400">
            {error}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="mt-4"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Access granted - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Access denied - show block screen
  return (
    <div className="container py-8 px-4">
      {customBlockContent || (
        <FeatureBlockCard
          feature={feature}
          blockReason={blockReason}
          userRole={userRole}
          onRedirect={handleRedirect}
        />
      )}
    </div>
  );
};
