
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, Users, Target, ArrowRight, Eye, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModernFeatureBlockProps {
  feature: string;
  blockReason: 'insufficient_role' | 'incomplete_onboarding' | 'none';
  hasRoleAccess: boolean;
  onboardingComplete: boolean;
  showPreview?: boolean;
}

const FEATURE_CONFIG = {
  networking: {
    title: 'Networking Inteligente',
    subtitle: 'Conecte-se com empreendedores ideais',
    description: 'Matchmaking personalizado com IA que conecta você com potenciais clientes e fornecedores baseado no seu perfil de negócio.',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-400',
    color: 'blue',
    features: [
      '5 indicações mensais de potenciais clientes',
      '3 indicações de fornecedores especializados',
      'Algoritmo de matching baseado em IA',
      'Perfis verificados e qualificados'
    ]
  },
  implementation_trail: {
    title: 'Trilha de Implementação',
    subtitle: 'Sua jornada personalizada de IA',
    description: 'Trilha completamente personalizada baseada no seu perfil de onboarding e objetivos específicos de negócio.',
    icon: Target,
    gradient: 'from-viverblue to-blue-400',
    color: 'viverblue',
    features: [
      'Recomendações personalizadas de soluções',
      'Cursos curados para seu nível',
      'Roadmap baseado em seus objetivos',
      'Acompanhamento de progresso inteligente'
    ]
  },
  learning: {
    title: 'Área de Aprendizado',
    subtitle: 'Educação personalizada em IA',
    description: 'Cursos e aulas direcionadas especificamente para seu setor e nível de conhecimento.',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-400',
    color: 'purple',
    features: [
      'Cursos personalizados por setor',
      'Aulas adaptadas ao seu nível',
      'Certificações reconhecidas',
      'Conteúdo sempre atualizado'
    ]
  }
};

export const ModernFeatureBlock: React.FC<ModernFeatureBlockProps> = ({
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
      navigate('/dashboard');
    }
  };

  const isOnboardingIncomplete = blockReason === 'incomplete_onboarding';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] via-[#151823] to-[#1a1d2e] flex items-center justify-center p-6">
      <motion.div 
        className="max-w-4xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header com título da feature */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${config.gradient} bg-opacity-10 mb-4`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {config.title}
          </h1>
          <p className="text-xl text-gray-300">
            {config.subtitle}
          </p>
        </motion.div>

        {/* Card principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Lado esquerdo - Informações */}
                <div className="space-y-6">
                  {/* Status */}
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-amber-400" />
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                      {isOnboardingIncomplete ? 'Onboarding Incompleto' : 'Acesso Restrito'}
                    </Badge>
                  </div>

                  {/* Descrição */}
                  <div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {config.description}
                    </p>
                  </div>

                  {/* Features preview */}
                  {showPreview && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-viverblue">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">O que você vai desbloquear:</span>
                      </div>
                      <ul className="space-y-2">
                        {config.features.map((feature, index) => (
                          <motion.li 
                            key={index}
                            className="flex items-center gap-3 text-gray-300"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                          >
                            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Progress do onboarding */}
                  {hasRoleAccess && (
                    <motion.div 
                      className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">Status do Onboarding</span>
                        <div className="flex items-center gap-2">
                          {onboardingComplete ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-400" />
                          )}
                          <span className="text-sm text-gray-300">
                            {onboardingComplete ? 'Completo' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                      {!onboardingComplete && (
                        <p className="text-xs text-gray-400">
                          Complete seu onboarding para personalizar sua experiência e desbloquear esta funcionalidade.
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Lado direito - Visual/Preview */}
                <div className="flex flex-col justify-center">
                  <motion.div 
                    className={`relative bg-gradient-to-br ${config.gradient} rounded-2xl p-8 text-white overflow-hidden`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Efeito de brilho */}
                    <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10 text-center">
                      <Icon className="h-16 w-16 mx-auto mb-4 opacity-90" />
                      <h3 className="text-xl font-bold mb-2">
                        Pronto para começar?
                      </h3>
                      <p className="text-white/80 text-sm">
                        {isOnboardingIncomplete 
                          ? 'Complete o onboarding em menos de 10 minutos'
                          : 'Funcionalidade premium disponível'
                        }
                      </p>
                    </div>

                    {/* Decoração de fundo */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                  </motion.div>

                  {/* Call to Action */}
                  <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <Button
                      onClick={handleAction}
                      className={`w-full bg-gradient-to-r ${config.gradient} hover:shadow-lg hover:shadow-${config.color}-500/25 transition-all duration-300 group`}
                      size="lg"
                    >
                      <ArrowRight className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      {isOnboardingIncomplete ? 'Completar Onboarding' : 'Saiba Mais'}
                    </Button>
                    
                    {isOnboardingIncomplete && (
                      <p className="text-center text-xs text-gray-400 mt-2">
                        ⏱️ Tempo estimado: 10-15 minutos
                      </p>
                    )}
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer informativo */}
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <p className="text-sm text-gray-500">
            🔒 Suas informações são seguras e usadas apenas para personalização
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
