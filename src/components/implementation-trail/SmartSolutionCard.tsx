import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Target, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { SolutionData } from '@/hooks/implementation-trail/useSolutionData';
import { useNavigate } from 'react-router-dom';

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
    label: 'Alta Prioridade',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: TrendingUp,
    description: 'Implementação imediata recomendada'
  },
  priority2: {
    label: 'Média Prioridade',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    icon: Target,
    description: 'Implemente após as prioridades altas'
  },
  priority3: {
    label: 'Baixa Prioridade',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Sparkles,
    description: 'Planeje para médio prazo'
  }
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Fácil', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  medium: { label: 'Médio', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  advanced: { label: 'Avançado', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
};

const CATEGORY_CONFIG = {
  'Receita': { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '💰' },
  'Marketing': { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: '📈' },
  'Operacional': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '⚙️' },
  'Automação': { color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: '🤖' }
};

export const SmartSolutionCard = ({
  solution,
  priority,
  aiScore,
  estimatedTime,
  justification,
  isImplemented = false
}: SmartSolutionCardProps) => {
  const navigate = useNavigate();
  const priorityConfig = PRIORITY_CONFIG[priority];
  const PriorityIcon = priorityConfig.icon;

  const handleImplement = () => {
    navigate(`/implementacao/${solution.id}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Altamente Compatível';
    if (score >= 70) return 'Boa Compatibilidade';
    return 'Compatibilidade Moderada';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 border-l-4 ${
      priority === 'priority1' ? 'border-l-red-500' : 
      priority === 'priority2' ? 'border-l-yellow-500' : 
      'border-l-blue-500'
    } ${isImplemented ? 'opacity-75' : 'hover:bg-card/90'} card-onboarding`}>
      {isImplemented && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Implementado
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`${priorityConfig.color} border`}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {priorityConfig.label}
              </Badge>
              
              {solution.category && (
                <Badge className={`${CATEGORY_CONFIG[solution.category]?.color || 'bg-muted text-muted-foreground'} border`}>
                  {CATEGORY_CONFIG[solution.category]?.icon} {solution.category}
                </Badge>
              )}
              
              <Badge className={`${DIFFICULTY_CONFIG[solution.difficulty]?.color || 'bg-muted text-muted-foreground'} border`}>
                {DIFFICULTY_CONFIG[solution.difficulty]?.label || solution.difficulty}
              </Badge>
            </div>

            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              {solution.title}
            </h3>

            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {solution.description}
            </p>
          </div>

          {solution.thumbnail_url && (
            <div className="flex-shrink-0">
              <img 
                src={solution.thumbnail_url} 
                alt={solution.title}
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Score de IA */}
        <div className="bg-muted/30 rounded-lg p-3 mb-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Compatibilidade IA
            </span>
            <span className={`text-lg font-bold ${getScoreColor(aiScore)}`}>
              {aiScore}%
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getScoreBgColor(aiScore)}`}
              style={{ width: `${aiScore}%` }}
            />
          </div>
          <p className={`text-xs mt-1 ${getScoreColor(aiScore)}`}>
            {getScoreLabel(aiScore)}
          </p>
        </div>

        {/* Justificativa personalizada */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Por que recomendamos:
          </h4>
          <p className="text-sm text-foreground bg-primary/5 p-2 rounded border border-primary/10">
            {justification}
          </p>
        </div>

        {/* Tempo estimado */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Tempo estimado: <span className="font-medium text-foreground">{estimatedTime}</span>
          </span>
        </div>

        {/* Tags */}
        {solution.tags && solution.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {solution.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded border border-border"
                >
                  {tag}
                </span>
              ))}
              {solution.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{solution.tags.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Botão de ação */}
        <Button 
          onClick={handleImplement}
          className="w-full"
          variant={isImplemented ? "outline" : "default"}
          disabled={isImplemented}
        >
          {isImplemented ? 'Já Implementado' : 'Começar Implementação'}
        </Button>
      </CardContent>
    </Card>
  );
};