import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface SimpleOnboardingStep6Props {
  data: any;
  onNext: (data: any) => void;
  isLoading?: boolean;
  onDataChange?: (data: any) => void;
}

export const SimpleOnboardingStep6: React.FC<SimpleOnboardingStep6Props> = ({
  data,
  onNext,
  isLoading = false
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);

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
    
    if (data.personal_info?.position && data.business_info?.business_sector) {
      insights.push(`Como ${data.personal_info?.position} no setor de ${data.business_info?.business_sector}`);
    }
    
    if (data.ai_experience?.aiKnowledgeLevel === 'avancado') {
      insights.push("seu conhecimento avançado em IA te coloca em posição privilegiada");
    } else if (data.ai_experience?.aiKnowledgeLevel === 'intermediario') {
      insights.push("sua base sólida em IA será potencializada exponencialmente");
    } else {
      insights.push("seu perfil iniciante é perfeito para construir fundamentos robustos");
    }
    
    if (data.goals_info?.mainObjective) {
      insights.push(`com foco em ${data.goals_info?.mainObjective.toLowerCase()}`);
    }
    
    return insights.join(', ');
  };

  const getRecommendationPreview = () => {
    const recommendations = [];
    
    if (data.personalization?.weeklyLearningTime === '1-2h') {
      recommendations.push('📚 Micro-learning focado');
      recommendations.push('⚡ Conteúdos de alta densidade');
    } else if (data.personalization?.weeklyLearningTime === '10h+') {
      recommendations.push('🎯 Trilha completa intensiva');
      recommendations.push('🛠️ Projetos hands-on avançados');
    }
    
    if (data.goals_info?.urgencyLevel?.includes('urgente')) {
      recommendations.push('🔥 Implementação acelerada');
      recommendations.push('📈 Resultados em 30 dias');
    }
    
    if (data.personalization?.wantsNetworking === 'yes') {
      recommendations.push('🤝 Acesso a network exclusiva');
      recommendations.push('🎪 Eventos VIP de networking');
    }
    
    return recommendations;
  };

  const handleComplete = () => {
    // Marcar onboarding como completo
    onNext({ is_completed: true });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Confetti Animation */}
      {confetti.map(({ id, left, delay }) => (
        <motion.div
          key={id}
          className="absolute w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full"
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
              className="w-32 h-32 mx-auto bg-gradient-to-br from-primary via-accent to-secondary rounded-full flex items-center justify-center shadow-2xl shadow-primary/50"
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 25px 50px -12px hsl(var(--primary) / 0.5)',
                  '0 25px 50px -12px hsl(var(--primary) / 0.8)',
                  '0 25px 50px -12px hsl(var(--primary) / 0.5)'
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Trophy className="w-16 h-16 text-primary-foreground" />
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
                <Sparkles className="w-4 h-4 text-accent" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-4"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              🎉 Missão Cumprida, {data.personal_info?.name || 'Futuro Expert'}!
            </h1>
            <p className="text-2xl text-muted-foreground font-medium">
              Seu perfil de IA personalizado está pronto! ✨
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
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
          <Card className="p-8 bg-gradient-to-br from-card/60 to-muted/30 border border-border backdrop-blur-sm">
            <div className="text-center space-y-6">
              <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-accent" />
                Conquistas Desbloqueadas
              </h3>
              
              <div className="flex justify-center gap-4">
                {[
                  { icon: Target, label: 'Visionário' },
                  { icon: Users, label: 'Colaborador' },
                  { icon: Zap, label: 'Iniciativa' }
                ].map((badge, index) => (
                  <motion.div
                    key={badge.label}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 1.5 + (index * 0.2),
                      type: "spring",
                      stiffness: 200 
                    }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                      <badge.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{badge.label}</span>
                  </motion.div>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Você desbloqueou 3 de 10 conquistas iniciais!
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
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" />
                <h4 className="text-lg font-bold text-foreground">Seu Plano Personalizado</h4>
              </div>
              
              <div className="space-y-2">
                {getRecommendationPreview().map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2 + (index * 0.1) }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {rec}
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-accent" />
                <h4 className="text-lg font-bold text-foreground">Próximos Passos</h4>
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
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
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
            <h3 className="text-2xl font-bold text-foreground">
              Pronto para Revolucionar sua Carreira? 🚀
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sua jornada personalizada com IA está pronta. Cada conteúdo, ferramenta e estratégia foi selecionada especificamente para SEU perfil e objetivos.
            </p>
          </div>

          {/* Estatística motivacional */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.5, type: "spring" }}
            className="inline-flex gap-6 p-4 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl border border-secondary/30"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">95%</div>
              <div className="text-xs text-muted-foreground">Taxa de Sucesso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">60h</div>
              <div className="text-xs text-muted-foreground">Economia Mensal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10x</div>
              <div className="text-xs text-muted-foreground">ROI Médio</div>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={isLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-2xl shadow-primary/50 animate-pulse"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Preparando sua jornada...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  🎯 Iniciar Minha Jornada Épica
                </>
              )}
            </Button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-xs text-muted-foreground flex items-center justify-center gap-1"
          >
            <Zap className="w-3 h-3" />
            Acesso instantâneo • Sem compromisso • Resultados garantidos
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};