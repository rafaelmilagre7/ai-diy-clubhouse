
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { OnboardingStep } from '@/types/onboarding';

interface AIMessageProps {
  step: OnboardingStep;
  data?: any;
  className?: string;
}

const getContextualMessage = (step: OnboardingStep, data?: any): string => {
  switch (step) {
    case 1:
      return `Olá! Sou sua assistente de IA personalizada. Estou aqui para tornar sua jornada no Viver de IA única e totalmente adaptada ao seu perfil. Vamos começar conhecendo você melhor!`;
    
    case 2:
      const name = data?.preferredName || data?.fullName;
      return `Excelente${name ? `, ${name}` : ''}! Agora preciso entender seu contexto empresarial para personalizar as soluções de IA que serão mais relevantes para sua realidade de negócio. Isso me ajudará a criar um plano sob medida para você.`;
    
    case 3:
      const company = data?.companyName;
      return `Perfeito! Agora preciso avaliar seu nível atual com IA para recomendar o caminho ideal${company ? ` para ${company}` : ''}. Não se preocupe se está começando - todos os níveis são bem-vindos e têm seu valor!`;
    
    case 4:
      return `Ótimo progresso! Agora vamos definir seus objetivos específicos. Com base no que você me contou sobre sua empresa e experiência, vou criar um plano de implementação focado nos seus resultados desejados.`;
    
    case 5:
      const objective = data?.mainObjective;
      const objectiveText = {
        'reduce_costs': 'redução de custos',
        'increase_sales': 'aumento de vendas', 
        'automate_processes': 'automação de processos',
        'innovate_products': 'inovação de produtos'
      }[objective] || 'seus objetivos';
      
      return `Estamos quase lá! Agora vou personalizar sua experiência de aprendizado para alcançar ${objectiveText}. Vou ajustar o conteúdo, cronograma e interações para maximizar seus resultados.`;
    
    default:
      return `Estou processando suas informações para criar uma experiência personalizada. Em instantes você terá acesso ao seu plano customizado!`;
  }
};

export const AIMessage: React.FC<AIMessageProps> = ({ 
  step, 
  data, 
  className = "" 
}) => {
  const message = getContextualMessage(step, data);
  
  return (
    <div className={`bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold relative">
          <Bot className="w-5 h-5" />
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-primary">Assistente IA Personalizada</h4>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
