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

// Sistema de IA inteligente com mensagens contextuais avançadas
const generateContextualMessage = (data: OnboardingData, step: number): string => {
  const { 
    name, companyName, position, aiKnowledgeLevel, mainObjective, 
    weeklyLearningTime, businessSector, aiToolsUsed, hasImplementedAI,
    urgencyLevel, expectedResult90Days, preferredSupport, aiImplementationBudget
  } = data;

  // Sistema de recomendações inteligentes baseado no perfil completo
  const getPersonalizedRecommendation = () => {
    const recommendations = [];
    
    if (aiKnowledgeLevel === 'iniciante') {
      recommendations.push("📚 Vou começar com fundamentos práticos e casos reais");
    } else if (aiKnowledgeLevel === 'avancado') {
      recommendations.push("🚀 Podemos partir direto para implementações complexas");
    }
    
    if (weeklyLearningTime === '1-2h') {
      recommendations.push("⏰ Conteúdos objetivos e de alta densidade");
    } else if (weeklyLearningTime === '10h+') {
      recommendations.push("📈 Trilha completa com projetos hands-on");
    }
    
    if (urgencyLevel?.includes('urgente')) {
      recommendations.push("🔥 Foco em resultados rápidos e impacto imediato");
    }
    
    return recommendations.length > 0 ? recommendations.join(" • ") : "";
  };

  // Mensagens contextuais super inteligentes por step
  switch (step) {
    case 1:
      if (name) {
        const timeOfDay = new Date().getHours();
        const greeting = timeOfDay < 12 ? "Bom dia" : timeOfDay < 18 ? "Boa tarde" : "Boa noite";
        return `${greeting}, ${name}! 👋 Que incrível te conhecer! Sou sua IA assistente e vou criar uma experiência única de aprendizado, moldada especificamente para você. Pronto(a) para descobrir seu potencial em IA?`;
      }
      return "Olá! 🌟 Sou sua IA assistente pessoal e estou aqui para criar uma jornada de aprendizado única e personalizada. Cada pergunta que faço me ajuda a entender melhor como transformar sua relação com a inteligência artificial. Vamos começar?";

    case 2:
      let businessMessage = "";
      if (companyName && position) {
        businessMessage = `Como ${position} na ${companyName}, você tem desafios únicos que a IA pode resolver. `;
      } else if (position) {
        businessMessage = `Sua posição como ${position} me dá insights valiosos sobre suas necessidades. `;
      }
      
      const sectorInsight = businessSector ? 
        `No setor de ${businessSector}, vejo oportunidades incríveis para automação e otimização. ` : "";
      
      return `${businessMessage}${sectorInsight}Estou mapeando seu contexto profissional para criar recomendações cirúrgicas. Cada empresa tem sua DNA única! 💼✨`;

    case 3:
      let aiMaturityMessage = "";
      const toolsCount = aiToolsUsed?.length || 0;
      
      if (hasImplementedAI === 'sim' && toolsCount > 0) {
        aiMaturityMessage = `Impressionante! Você já usa ${toolsCount} ferramenta${toolsCount > 1 ? 's' : ''} de IA. Isso mostra que você está à frente da curva. `;
      } else if (hasImplementedAI === 'parcial') {
        aiMaturityMessage = "Estar em fase de testes é o momento perfeito! Você tem a mente aberta para experimentar. ";
      } else {
        aiMaturityMessage = "Começar do zero pode ser uma vantagem - sem vícios, apenas as melhores práticas! ";
      }
      
      const knowledgeBoost = aiKnowledgeLevel === 'avancado' ? 
        "Com seu nível avançado, podemos explorar fronteiras." :
        aiKnowledgeLevel === 'intermediario' ?
        "Seu conhecimento intermediário é uma base sólida para voar mais alto." :
        "Seu perfil iniciante me permite construir uma base inabalável.";
      
      return `${aiMaturityMessage}${knowledgeBoost} 🧠⚡`;

    case 4:
      let objectiveInsight = "";
      const budget = aiImplementationBudget;
      const timeline = expectedResult90Days;
      
      if (mainObjective?.includes('automatizar')) {
        objectiveInsight = "Automatização é o Santo Graal da produtividade! ";
      } else if (mainObjective?.includes('atendimento')) {
        objectiveInsight = "Revolucionar o atendimento ao cliente é puro gold! ";
      } else if (mainObjective?.includes('dados')) {
        objectiveInsight = "Transformar dados em insights é o superpoder do século! ";
      }
      
      const budgetInsight = budget?.includes('10k-25k') ? 
        "Com seu orçamento, podemos implementar soluções robustas. " :
        budget?.includes('250k') ?
        "Seu investimento abre portas para transformações significativas. " : "";
      
      const urgencyInsight = urgencyLevel?.includes('urgente') ?
        "🔥 Sua urgência me inspira - vamos focar em resultados tangíveis e rápidos!" :
        "📅 Com planejamento estratégico, construiremos algo duradouro.";
      
      return `${objectiveInsight}${budgetInsight}${urgencyInsight} Seus objetivos são meu GPS! 🎯`;

    case 5:
      const timeInsight = weeklyLearningTime === '10h+' ? 
        "Com 10+ horas semanais, você está no modo 'beast mode'! " :
        weeklyLearningTime === '1-2h' ?
        "1-2 horas é perfeito para aprendizado focado e sem sobrecarga. " : "";
      
      const contentStrategy = data.contentPreference?.includes('Vídeo-aulas') ?
        "Vídeo-aulas práticas serão seu formato principal. " :
        data.contentPreference?.includes('hands-on') ?
        "Exercícios hands-on vão acelerar seu aprendizado. " : "";
      
      const networkingNote = data.wantsNetworking === 'yes' ?
        "🤝 E que bom que quer networking - as melhores oportunidades nascem das conexões!" :
        "🎯 Foco total no conteúdo - respeito sua preferência por aprendizado individual.";
      
      return `${timeInsight}${contentStrategy}${networkingNote} Suas preferências moldam sua experiência! 🎨`;

    case 6:
      const personalizedPlan = getPersonalizedRecommendation();
      let finalMessage = `🎉 ${name || 'Incrível pessoa'}, acabamos de criar algo especial juntos! `;
      
      if (position && businessSector) {
        finalMessage += `Como ${position} no setor de ${businessSector}, `;
      }
      
      finalMessage += "analisei cada resposta sua e criei um plano de transformação único. ";
      
      if (personalizedPlan) {
        finalMessage += `Aqui está o que preparei: ${personalizedPlan}. `;
      }
      
      if (mainObjective) {
        finalMessage += `Nosso foco será ${mainObjective}, com resultados mensuráveis. `;
      }
      
      const motivationalClose = urgencyLevel?.includes('urgente') ?
        "🚀 Vamos começar AGORA sua revolução com IA!" :
        "🌟 Está pronto(a) para se tornar um(a) especialista em IA?";
      
      finalMessage += motivationalClose;
      
      return finalMessage;

    default:
      const stepMotivation = [
        "✨ Cada resposta sua me ajuda a conhecê-lo(a) melhor",
        "🎯 Estamos construindo seu perfil ideal de aprendizado", 
        "💡 Sua jornada de transformação já começou",
        "🚀 Faltam poucos cliques para sua revolução pessoal",
        "🌟 Você está moldando seu futuro com IA"
      ];
      return stepMotivation[Math.min(step - 1, stepMotivation.length - 1)] + "!";
  }
};

const getMaturityDescription = (level: string): string => {
  switch (level) {
    case 'beginner':
    case 'iniciante': 
      return 'iniciante em IA';
    case 'intermediate':
    case 'intermediario': 
      return 'com conhecimento intermediário em IA';
    case 'advanced':
    case 'avancado': 
      return 'experiente em IA';
    default: 
      return '';
  }
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