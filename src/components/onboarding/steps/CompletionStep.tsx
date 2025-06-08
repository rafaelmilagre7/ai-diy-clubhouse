
import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, ArrowRight, Trophy, Target, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingData, OnboardingType } from '@/types/onboarding';
import { calculateOverallScore } from '@/utils/onboardingValidation';

interface CompletionStepProps {
  data: Partial<OnboardingData>;
  type: OnboardingType;
  onFinish?: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  data,
  type,
  onFinish
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);
  const score = calculateOverallScore(data);

  const phases = [
    "Analisando seu perfil empresarial...",
    "Identificando oportunidades de IA...",
    "Criando plano personalizado...",
    "Configurando dashboard...",
    "Preparando recursos exclusivos..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhase(prev => {
        if (prev >= phases.length - 1) {
          setIsGenerating(false);
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, []);

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-3">
            Criando sua experiência personalizada...
          </h1>
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-6 mb-8">
          <div className="space-y-4">
            {phases.map((phase, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  index < currentPhase ? 'bg-green-500' :
                  index === currentPhase ? 'bg-primary animate-pulse' :
                  'bg-muted'
                }`}>
                  {index < currentPhase ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : index === currentPhase ? (
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  ) : (
                    <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                  )}
                </div>
                <span className={`text-sm ${
                  index <= currentPhase ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {phase}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground">
          Estamos processando suas {Object.keys(data).length} informações para criar uma experiência única...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
          Parabéns, {data.preferredName || data.fullName}! 🎉
        </h1>
        <p className="text-xl text-muted-foreground">
          Seu perfil foi criado com {score}% de completude
        </p>
      </div>

      {/* Main AI Success Message */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-3">Seu Plano Personalizado Está Pronto!</h3>
            <p className="text-white/90 mb-4">
              Com base no seu perfil da <strong>{data.companyName}</strong> no setor de <strong>
                {data.businessSector === 'technology' ? 'Tecnologia' : 
                 data.businessSector === 'services' ? 'Serviços' :
                 data.businessSector || 'seu setor'}
              </strong>, criei um plano de implementação de IA específico para seus objetivos.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4">
                <Target className="w-5 h-5 mb-2" />
                <h4 className="font-semibold mb-1">Foco Principal</h4>
                <p className="text-sm text-white/80">
                  {data.mainObjective === 'reduce_costs' && 'Redução de custos operacionais'}
                  {data.mainObjective === 'increase_sales' && 'Aumento de vendas e receita'}
                  {data.mainObjective === 'automate_processes' && 'Automação de processos'}
                  {data.mainObjective === 'innovate_products' && 'Inovação de produtos/serviços'}
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <Zap className="w-5 h-5 mb-2" />
                <h4 className="font-semibold mb-1">Nível Adequado</h4>
                <p className="text-sm text-white/80">
                  {data.aiKnowledgeLevel === 'beginner' && 'Trilha para Iniciantes'}
                  {data.aiKnowledgeLevel === 'intermediate' && 'Nível Intermediário'}
                  {data.aiKnowledgeLevel === 'advanced' && 'Conteúdo Avançado'}
                  {data.aiKnowledgeLevel === 'expert' && 'Desafios para Experts'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Plano Personalizado</h3>
          <p className="text-sm text-muted-foreground">
            Roteiro específico para sua empresa e objetivos
          </p>
        </div>

        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Comunidade Exclusiva</h3>
          <p className="text-sm text-muted-foreground">
            Conecte-se com profissionais do seu setor
          </p>
        </div>

        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">IA Personalizada</h3>
          <p className="text-sm text-muted-foreground">
            Assistente que evolui com seu progresso
          </p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Seus Próximos Passos Estão Prontos
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <span className="text-sm">Acessar seu dashboard personalizado</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="text-sm">Implementar sua primeira solução de IA recomendada</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <span className="text-sm">Participar da comunidade exclusiva de {data.businessSector}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <Button 
          onClick={onFinish}
          size="lg"
          className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          <span>Acessar Minha Área Personalizada</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <p className="text-sm text-muted-foreground mt-4">
          Você pode atualizar suas preferências a qualquer momento no seu perfil
        </p>
      </div>
    </div>
  );
};
