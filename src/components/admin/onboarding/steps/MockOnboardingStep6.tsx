import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { 
  Sparkles, 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  Users,
  Star,
  CheckCircle,
  Rocket
} from 'lucide-react';
import { GamificationBadge, createProfileBadges } from '@/components/onboarding/components/GamificationBadge';
import { EnhancedButton } from '@/components/onboarding/components/EnhancedButton';

interface MockOnboardingStep6Props {
  data: OnboardingData;
  onUpdateData?: (newData: Partial<OnboardingData>) => void;
  onComplete?: () => void;
  isCompleting?: boolean;
}

const MockOnboardingStep6: React.FC<MockOnboardingStep6Props> = ({
  data,
  onUpdateData = () => {},
  onComplete,
  isCompleting = false
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);
  const badges = createProfileBadges(data);
  const earnedBadges = badges.filter(b => b.earned);

  useEffect(() => {
    // Trigger celebration animation
    setShowCelebration(true);
    
    // Generate confetti
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setConfetti(newConfetti);
  }, []);

  const getPersonalizedSummary = () => {
    const insights = [];
    
    if (data.position && data.businessSector) {
      insights.push(`Como ${data.position} no setor de ${data.businessSector}`);
    }
    
    if (data.aiKnowledgeLevel === 'avancado') {
      insights.push("seu conhecimento avançado em IA te coloca em posição privilegiada");
    } else if (data.aiKnowledgeLevel === 'intermediario') {
      insights.push("sua base sólida em IA será potencializada exponencialmente");
    } else {
      insights.push("seu perfil iniciante é perfeito para construir fundamentos robustos");
    }
    
    if (data.mainObjective) {
      insights.push(`com foco em ${data.mainObjective.toLowerCase()}`);
    }
    
    return insights.join(', ');
  };

  const getRecommendationPreview = () => {
    const recommendations = [];
    
    if (data.weeklyLearningTime === '1-2h') {
      recommendations.push('📚 Micro-learning focado');
      recommendations.push('⚡ Conteúdos de alta densidade');
    } else if (data.weeklyLearningTime === '10h+') {
      recommendations.push('🎯 Trilha completa intensiva');
      recommendations.push('🛠️ Projetos hands-on avançados');
    }
    
    if (data.urgencyLevel?.includes('urgente')) {
      recommendations.push('🔥 Implementação acelerada');
      recommendations.push('📈 Resultados em 30 dias');
    }
    
    if (data.wantsNetworking === 'yes') {
      recommendations.push('🤝 Acesso a network exclusiva');
      recommendations.push('🎪 Eventos VIP de networking');
    }
    
    return recommendations;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Confetti Animation */}
      {confetti.map(({ id, left, delay }) => (
        <motion.div
          key={id}
          className="absolute w-3 h-3 bg-gradient-to-r from-viverblue to-yellow-400 rounded-full"
          style={{ left: `${left}%`, top: '-10px' }}
          initial={{ y: -100, rotate: 0, opacity: 1 }}
          animate={{ 
            y: window.innerHeight + 100, 
            rotate: 720, 
            opacity: 0 
          }}
          transition={{ 
            duration: 3,
            delay: delay,
            ease: "easeOut"
          }}
        />
      ))}

      <div className="w-full max-w-4xl space-y-8">
        {/* Header épico */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <motion.div
              className="w-32 h-32 mx-auto bg-gradient-to-br from-viverblue via-strategy to-operational rounded-full flex items-center justify-center shadow-2xl shadow-viverblue/50"
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 25px 50px -12px rgba(0, 255, 255, 0.5)',
                  '0 25px 50px -12px rgba(0, 255, 255, 0.8)',
                  '0 25px 50px -12px rgba(0, 255, 255, 0.5)'
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Trophy className="w-16 h-16 text-white" />
            </motion.div>
            
            {/* Sparkles around trophy */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0'
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.25,
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-4"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-viverblue-light to-strategy bg-clip-text text-transparent">
              🎉 Missão Cumprida, {data.name}!
            </h1>
            <p className="text-2xl text-slate-300 font-medium">
              Seu perfil de IA personalizado está pronto! ✨
            </p>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              {getPersonalizedSummary()} - acabamos de criar um plano único para acelerar sua jornada de transformação com Inteligência Artificial.
            </p>
          </motion.div>
        </motion.div>

        {/* Badges conquistadas */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center"
        >
          <Card className="p-8 bg-gradient-to-br from-white/10 to-white/5 border border-viverblue/20 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                Conquistas Desbloqueadas
              </h3>
              
              <div className="flex justify-center gap-4">
                {earnedBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 1.5 + (index * 0.2),
                      type: "spring",
                      stiffness: 200 
                    }}
                  >
                    <GamificationBadge 
                      badge={badge}
                      size="lg"
                      animated={true}
                    />
                  </motion.div>
                ))}
              </div>
              
              <p className="text-sm text-slate-400">
                Você desbloqueou {earnedBadges.length} de {badges.length} conquistas!
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Preview das recomendações */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card className="p-6 bg-gradient-to-br from-viverblue/10 to-viverblue/5 border border-viverblue/20">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-viverblue" />
                <h4 className="text-lg font-bold text-white">Seu Plano Personalizado</h4>
              </div>
              
              <div className="space-y-2">
                {getRecommendationPreview().map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2 + (index * 0.1) }}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {rec}
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-strategy/10 to-strategy/5 border border-strategy/20">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-strategy" />
                <h4 className="text-lg font-bold text-white">Próximos Passos</h4>
              </div>
              
              <div className="space-y-2">
                {[
                  "🚀 Acesso liberado à plataforma completa",
                  "📚 Módulos selecionados especialmente para você",
                  "🎯 Metas personalizadas baseadas no seu perfil",
                  "🤖 IA Assistant sempre disponível para dúvidas"
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2.2 + (index * 0.1) }}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <CheckCircle className="w-4 h-4 text-strategy flex-shrink-0" />
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Call to action épico */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center space-y-6"
        >
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white">
              Pronto para Revolucionar sua Carreira? 🚀
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Sua jornada personalizada com IA está pronta. Cada conteúdo, ferramenta e estratégia foi selecionada especificamente para SEU perfil e objetivos.
            </p>
          </div>

          {/* Estatística motivacional */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.5, type: "spring" }}
            className="inline-flex gap-6 p-4 bg-gradient-to-r from-operational/20 to-revenue/20 rounded-2xl border border-operational/30"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-operational">95%</div>
              <div className="text-xs text-slate-400">Taxa de Sucesso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-revenue">60h</div>
              <div className="text-xs text-slate-400">Economia Mensal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-strategy">10x</div>
              <div className="text-xs text-slate-400">ROI Médio</div>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <EnhancedButton
              variant="primary"
              size="lg"
              icon={Rocket}
              onClick={onComplete}
              loading={isCompleting}
              className="w-full sm:w-auto animate-pulse-glow shadow-2xl shadow-viverblue/50"
            >
              {isCompleting ? "Preparando sua jornada..." : "🎯 Iniciar Minha Jornada Épica"}
            </EnhancedButton>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-xs text-slate-500 flex items-center justify-center gap-1"
          >
            <Zap className="w-3 h-3" />
            Acesso instantâneo • Sem compromisso • Resultados garantidos
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default MockOnboardingStep6;