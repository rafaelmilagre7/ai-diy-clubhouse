import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TypingEffect } from './TypingEffect';
import { Bot, Sparkles, User } from 'lucide-react';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface AIPersonalizedMessageProps {
  data: OnboardingData;
  step: number;
  className?: string;
  showAvatar?: boolean;
  animated?: boolean;
}

// Mensagens contextuais baseadas nos dados coletados
const generateContextualMessage = (data: OnboardingData, step: number): string => {
  const { personalInfo, professionalInfo, aiMaturityLevel, objectives } = data;

  // Mensagens para cada step baseadas no contexto
  switch (step) {
    case 1:
      if (personalInfo?.name) {
        return `Olá, ${personalInfo.name}! 👋 É um prazer te conhecer. Vou te ajudar a criar um perfil personalizado para maximizar seu aprendizado em IA.`;
      }
      return "Bem-vindo(a)! 🌟 Vou te acompanhar nesta jornada personalizada de aprendizado em IA. Vamos começar?";

    case 2:
      if (professionalInfo?.companyName && professionalInfo?.role) {
        return `Interessante! Como ${professionalInfo.role} na ${professionalInfo.companyName}, você tem uma perspectiva única. Vou personalizar as recomendações baseadas no seu setor.`;
      } else if (professionalInfo?.role) {
        return `Como ${professionalInfo.role}, você deve ter desafios específicos. Vou focar em soluções práticas para sua área.`;
      }
      return "Entender seu contexto profissional me ajuda a recomendar as melhores ferramentas e estratégias para você! 💼";

    case 3:
      if (aiMaturityLevel === 'beginner') {
        return "Perfeito! Começar do básico é sempre a melhor estratégia. Vou focar em fundamentos sólidos e aplicações práticas. 🌱";
      } else if (aiMaturityLevel === 'intermediate') {
        return "Ótimo! Com sua base em IA, posso sugerir implementações mais avançadas e cases práticos. 🚀";
      } else if (aiMaturityLevel === 'advanced') {
        return "Excelente! Sua experiência permite explorarmos estratégias avançadas e casos de uso complexos. 🎯";
      }
      return "Conhecer seu nível em IA me permite personalizar totalmente sua experiência de aprendizado! 🤖";

    case 4:
      if (objectives?.includes('increase_productivity')) {
        return "Produtividade é fundamental! Vou priorizar ferramentas que otimizam processos e economizam tempo. ⚡";
      } else if (objectives?.includes('automate_processes')) {
        return "Automação é o futuro! Focaremos em soluções que eliminam tarefas repetitivas. 🔄";
      } else if (objectives?.includes('improve_decision_making')) {
        return "Decisões baseadas em dados são mais assertivas! Vou mostrar como a IA pode ajudar. 📊";
      }
      return "Seus objetivos são o compass da sua jornada. Vou personalizar tudo baseado no que você quer alcançar! 🎯";

    case 5:
      const hasTimeConstraints = data.preferences?.availableTime === 'low';
      if (hasTimeConstraints) {
        return "Entendo que seu tempo é limitado. Vou priorizar conteúdos práticos e de impacto imediato. ⏰";
      }
      return "Quase lá! Suas preferências garantem que você tenha a melhor experiência possível. 🎨";

    case 6:
      let message = `Parabéns, ${personalInfo?.name || 'pessoa incrível'}! 🎉 `;
      
      if (professionalInfo?.role && aiMaturityLevel) {
        message += `Como ${professionalInfo.role} ${getMaturityDescription(aiMaturityLevel)}, `;
      }
      
      message += "criei um plano personalizado baseado em tudo que compartilhou comigo. ";
      
      if (objectives?.length > 0) {
        message += `Focaremos especialmente em ${getObjectivesDescription(objectives)}. `;
      }
      
      message += "Está pronto(a) para começar sua transformação com IA? 🚀";
      
      return message;

    default:
      return "Vamos continuar construindo seu perfil personalizado! ✨";
  }
};

const getMaturityDescription = (level: string): string => {
  switch (level) {
    case 'beginner': return 'iniciante em IA';
    case 'intermediate': return 'com conhecimento intermediário em IA';
    case 'advanced': return 'experiente em IA';
    default: return '';
  }
};

const getObjectivesDescription = (objectives: string[]): string => {
  const descriptions: { [key: string]: string } = {
    'increase_productivity': 'aumentar produtividade',
    'automate_processes': 'automatizar processos',
    'improve_decision_making': 'melhorar tomada de decisões',
    'enhance_creativity': 'potencializar criatividade',
    'optimize_costs': 'otimizar custos',
    'competitive_advantage': 'obter vantagem competitiva'
  };

  const mapped = objectives.map(obj => descriptions[obj] || obj).filter(Boolean);
  
  if (mapped.length === 1) return mapped[0];
  if (mapped.length === 2) return `${mapped[0]} e ${mapped[1]}`;
  return `${mapped.slice(0, -1).join(', ')} e ${mapped[mapped.length - 1]}`;
};

export const AIPersonalizedMessage: React.FC<AIPersonalizedMessageProps> = ({
  data,
  step,
  className,
  showAvatar = true,
  animated = true
}) => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const newMessage = generateContextualMessage(data, step);
    setMessage(newMessage);
    
    // Delay para transição suave
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [data, step]);

  if (!isVisible) {
    return (
      <div className={cn("ai-message", className)}>
        <div className="flex items-center gap-3">
          {showAvatar && (
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-viverblue to-viverblue-light flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
          <div className="flex-1">
            <div className="w-full h-4 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "ai-message animate-in slide-in-from-left-5 duration-500",
      className
    )}>
      <div className="flex items-start gap-3">
        {showAvatar && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-viverblue to-viverblue-light flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-viverblue flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              IA Assistant
            </h4>
            <span className="text-xs text-muted-foreground">
              Step {step}/6
            </span>
          </div>
          
          <div className="text-sm leading-relaxed">
            {animated ? (
              <TypingEffect 
                text={message} 
                speed={25} 
                startDelay={200}
              />
            ) : (
              <p>{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};