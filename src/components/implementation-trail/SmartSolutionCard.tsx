import { useNavigate } from 'react-router-dom';
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';
import { usePremiumUpgradeModal } from '@/hooks/usePremiumUpgradeModal';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Settings, BarChart, Brain, Users, Lightbulb, Zap, ArrowRight } from 'lucide-react';
import { SolutionData } from './contexts/SolutionDataContext';
import { cn } from '@/lib/utils';
import { CardContentSection } from '@/components/dashboard/CardContent';

interface SmartSolutionCardProps {
  solution: SolutionData;
  priority: 'priority1' | 'priority2' | 'priority3';
  aiScore: number;
  estimatedTime: string;
  justification: string;
  isImplemented?: boolean;
}

const PRIORITY_CONFIG = {
  priority1: { 
    label: 'Alta', 
    color: 'text-red-300', 
    bgColor: 'bg-red-900/40 border-red-700',
    emoji: '🔥'
  },
  priority2: { 
    label: 'Média', 
    color: 'text-amber-300', 
    bgColor: 'bg-amber-900/40 border-amber-700',
    emoji: '⚡'
  },
  priority3: { 
    label: 'Baixa', 
    color: 'text-blue-300', 
    bgColor: 'bg-blue-900/40 border-blue-700',
    emoji: '📋'
  }
} as const;

const DIFFICULTY_CONFIG = {
  easy: { 
    label: 'Fácil', 
    color: 'text-green-300', 
    bgColor: 'bg-green-900/40 border-green-700',
    emoji: '🟢'
  },
  medium: { 
    label: 'Médio', 
    color: 'text-amber-300', 
    bgColor: 'bg-amber-900/40 border-amber-700',
    emoji: '🟡'
  },
  advanced: { 
    label: 'Avançado', 
    color: 'text-red-300', 
    bgColor: 'bg-red-900/40 border-red-700',
    emoji: '🔴'
  }
} as const;

const CATEGORY_CONFIG = {
  'Receita': { 
    icon: TrendingUp, 
    borderColor: 'border-l-revenue border-l-4',
    bgColor: 'bg-revenue-darker/20',
    emoji: '💰'
  },
  'Operacional': { 
    icon: Settings, 
    borderColor: 'border-l-operational border-l-4',
    bgColor: 'bg-operational-darker/20',
    emoji: '⚙️'
  },
  'Estratégia': { 
    icon: BarChart, 
    borderColor: 'border-l-strategy border-l-4',
    bgColor: 'bg-strategy-darker/20',
    emoji: '📊'
  },
  'IA e Automação': { 
    icon: Brain, 
    borderColor: 'border-l-viverblue border-l-4',
    bgColor: 'bg-viverblue/10',
    emoji: '🤖'
  },
  'Processos': { 
    icon: Users, 
    borderColor: 'border-l-accent border-l-4',
    bgColor: 'bg-accent/10',
    emoji: '👥'
  }
} as const;

const AI_SCORE_CONFIG = {
  high: { 
    color: 'text-green-300', 
    bgColor: 'bg-green-900/40 border-green-700',
    emoji: '🎯',
    label: 'Alta Compatibilidade'
  },
  medium: { 
    color: 'text-amber-300', 
    bgColor: 'bg-amber-900/40 border-amber-700',
    emoji: '🎪',
    label: 'Boa Compatibilidade'
  },
  low: { 
    color: 'text-red-300', 
    bgColor: 'bg-red-900/40 border-red-700',
    emoji: '⚠️',
    label: 'Baixa Compatibilidade'
  }
} as const;

export const SmartSolutionCard = ({
  solution,
  priority,
  aiScore,
  estimatedTime,
  justification,
  isImplemented = false
}: SmartSolutionCardProps) => {
  const navigate = useNavigate();
  const { hasFeatureAccess } = useFeatureAccess();
  const { showUpgradeModal } = usePremiumUpgradeModal();

  const handleImplement = () => {
    if (!hasFeatureAccess('solutions')) {
      showUpgradeModal('solutions', solution.title);
      return;
    }
    navigate(`/implementacao/${solution.id}`);
  };

  const getAiScoreLevel = (score: number) => {
    if (score >= 85) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
  };

  const getCategoryStyle = (category: string) => {
    const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
    return config ? `${config.borderColor} ${config.bgColor}` : "border-l-viverblue border-l-4 bg-viverblue/10";
  };

  const getCategoryIcon = (category: string) => {
    const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
    const IconComponent = config?.icon || Lightbulb;
    return <IconComponent className="h-3.5 w-3.5 mr-1" />;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG];
    if (!config) return null;
    
    return (
      <Badge variant="outline" className={cn("text-xs", config.bgColor, config.color)}>
        <span className="mr-1">{config.emoji}</span>
        {config.label}
      </Badge>
    );
  };

  const priorityConfig = PRIORITY_CONFIG[priority];
  const aiScoreLevel = getAiScoreLevel(aiScore);
  const aiScoreConfig = AI_SCORE_CONFIG[aiScoreLevel];

  return (
    <Card 
      className={cn(
        "h-full cursor-pointer group transition-all duration-300 overflow-hidden transform hover:-translate-y-1 bg-[#151823] border-neutral-700",
        getCategoryStyle(solution.category),
        isImplemented && "opacity-75"
      )}
      onClick={handleImplement}
    >
      {/* Image/Thumbnail */}
      <div className="h-36 overflow-hidden relative">
        {solution.thumbnail_url ? (
          <img 
            src={solution.thumbnail_url}
            alt={solution.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1A1E2E]">
            <span className="text-4xl font-bold text-neutral-400">
              {solution.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-transparent to-transparent opacity-90"></div>
        
        {/* AI Score Overlay */}
        <div className="absolute top-2 right-2">
          <Badge className={cn("text-xs font-medium", aiScoreConfig.bgColor, aiScoreConfig.color)}>
            <Zap className="h-3 w-3 mr-1" />
            {aiScore}%
          </Badge>
        </div>

        {/* Priority Badge Overlay */}
        <div className="absolute top-2 left-2">
          <Badge className={cn("text-xs font-medium", priorityConfig.bgColor, priorityConfig.color)}>
            <span className="mr-1">{priorityConfig.emoji}</span>
            {priorityConfig.label}
          </Badge>
        </div>

        {/* Implemented Badge */}
        {isImplemented && (
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-green-900/40 text-green-300 border-green-700 text-xs">
              Implementado
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 pb-2">
        <CardContentSection title={solution.title} description={solution.description} />
        
        {/* AI Justification */}
        <div className="mt-3 p-3 rounded-lg bg-background/20 border-l-2 border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-high-contrast">Recomendação IA</span>
          </div>
          <p className="text-xs text-medium-contrast leading-relaxed">
            {justification}
          </p>
        </div>

        {/* Estimated Time */}
        <div className="mt-2 flex items-center gap-2 text-xs text-medium-contrast">
          <Clock className="h-3 w-3" />
          <span>Tempo estimado: {estimatedTime}</span>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 flex items-center justify-between border-t border-neutral-800">
        <div className="flex items-center space-x-1 text-xs text-neutral-300">
          {getCategoryIcon(solution.category)}
          <span>{solution.category}</span>
        </div>
        {getDifficultyBadge(solution.difficulty)}
      </CardFooter>
    </Card>
  );
};