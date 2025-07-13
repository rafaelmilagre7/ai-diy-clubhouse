import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Target, Sparkles, TrendingUp, CheckCircle, Zap, ArrowRight } from 'lucide-react';
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
    label: 'Alta',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    gradient: 'from-destructive/20 to-destructive/5',
    icon: Zap,
    emoji: '🚀',
    description: 'Implementação imediata recomendada'
  },
  priority2: {
    label: 'Média',
    color: 'bg-warning/10 text-warning border-warning/20',
    gradient: 'from-warning/20 to-warning/5',
    icon: Target,
    emoji: '⭐',
    description: 'Implemente após as prioridades altas'
  },
  priority3: {
    label: 'Baixa',
    color: 'bg-primary/10 text-primary border-primary/20',
    gradient: 'from-primary/20 to-primary/5',
    icon: Sparkles,
    emoji: '💎',
    description: 'Planeje para médio prazo'
  }
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Fácil', color: 'bg-success/10 text-success border-success/20', emoji: '🟢' },
  medium: { label: 'Médio', color: 'bg-warning/10 text-warning border-warning/20', emoji: '🟡' },
  advanced: { label: 'Avançado', color: 'bg-destructive/10 text-destructive border-destructive/20', emoji: '🔴' }
};

const CATEGORY_CONFIG = {
  'Receita': { color: 'bg-success/10 text-success border-success/20', icon: '💰', bgGradient: 'from-success/10 to-transparent' },
  'Marketing': { color: 'bg-accent/10 text-accent border-accent/20', icon: '📈', bgGradient: 'from-accent/10 to-transparent' },
  'Operacional': { color: 'bg-primary/10 text-primary border-primary/20', icon: '⚙️', bgGradient: 'from-primary/10 to-transparent' },
  'Automação': { color: 'bg-warning/10 text-warning border-warning/20', icon: '🤖', bgGradient: 'from-warning/10 to-transparent' }
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
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Altamente Compatível';
    if (score >= 70) return 'Boa Compatibilidade';
    return 'Compatibilidade Moderada';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-success';
    if (score >= 70) return 'bg-warning';
    return 'bg-destructive';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🎯';
    if (score >= 70) return '👍';
    return '⚡';
  };

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 ${
      isImplemented ? 'opacity-75' : 'hover:bg-gradient-to-br hover:from-card hover:to-muted/10'
    } card-onboarding border-0 bg-gradient-to-br ${priorityConfig.gradient}`}>
      
      {/* Priority Border & Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${priorityConfig.gradient} opacity-20`} />
      <div className={`absolute left-0 top-0 w-1 h-full ${
        priority === 'priority1' ? 'bg-destructive' : 
        priority === 'priority2' ? 'bg-warning' : 
        'bg-primary'
      }`} />
      
      {/* Floating Priority Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className={`${priorityConfig.color} rounded-full px-3 py-1 text-xs font-semibold shadow-lg border-2 border-background`}>
          {priorityConfig.emoji} {priorityConfig.label}
        </div>
      </div>

      {isImplemented && (
        <div className="absolute top-4 right-4 z-20">
          <Badge className="bg-success/10 text-success border-success/20 shadow-lg">
            <CheckCircle className="h-3 w-3 mr-1" />
            Implementado
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Category & Difficulty Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {solution.category && (
                <Badge className={`${CATEGORY_CONFIG[solution.category]?.color || 'bg-muted text-muted-foreground'} border-0 shadow-sm font-medium`}>
                  {CATEGORY_CONFIG[solution.category]?.icon} {solution.category}
                </Badge>
              )}
              
              <Badge className={`${DIFFICULTY_CONFIG[solution.difficulty]?.color || 'bg-muted text-muted-foreground'} border-0 shadow-sm font-medium`}>
                {DIFFICULTY_CONFIG[solution.difficulty]?.emoji} {DIFFICULTY_CONFIG[solution.difficulty]?.label || solution.difficulty}
              </Badge>
            </div>

            {/* Title with Gradient */}
            <h3 className="font-heading font-bold text-xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent group-hover:from-primary group-hover:to-foreground transition-all duration-300">
              {solution.title}
            </h3>

            <p className="text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-foreground/80 transition-colors">
              {solution.description}
            </p>
          </div>

          {/* Enhanced Thumbnail */}
          {solution.thumbnail_url && (
            <div className="flex-shrink-0 relative">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border/50 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <img 
                  src={solution.thumbnail_url} 
                  alt={solution.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 relative z-10 space-y-5">
        {/* Enhanced AI Score */}
        <div className="relative overflow-hidden bg-gradient-to-r from-muted/50 to-muted/20 rounded-xl p-4 border border-border/50 group-hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getScoreEmoji(aiScore)}</span>
              <span className="font-medium text-foreground">
                Compatibilidade IA
              </span>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-black ${getScoreColor(aiScore)}`}>
                {aiScore}%
              </span>
              <p className={`text-xs font-medium ${getScoreColor(aiScore)}`}>
                {getScoreLabel(aiScore)}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-border/50 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-700 ease-out ${getScoreBgColor(aiScore)} relative`}
                style={{ width: `${aiScore}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
          
          {/* Floating score indicator */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>

        {/* Enhanced Justification */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent rounded-xl p-4 border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50" />
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="text-lg">🎯</span>
            Por que recomendamos
          </h4>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {justification}
          </p>
        </div>

        {/* Enhanced Time Estimate */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Tempo Estimado
            </span>
            <p className="font-semibold text-foreground">{estimatedTime}</p>
          </div>
        </div>

        {/* Enhanced Tags */}
        {solution.tags && solution.tags.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tecnologias
            </h5>
            <div className="flex flex-wrap gap-2">
              {solution.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs bg-gradient-to-r from-muted to-muted/80 text-foreground px-3 py-1.5 rounded-full border border-border/50 font-medium shadow-sm hover:shadow-md transition-shadow"
                >
                  {tag}
                </span>
              ))}
              {solution.tags.length > 3 && (
                <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-dashed border-border">
                  +{solution.tags.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Action Button */}
        <Button 
          onClick={handleImplement}
          className={`w-full h-12 font-semibold text-base transition-all duration-300 group-hover:shadow-lg ${
            !isImplemented ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25' : ''
          }`}
          variant={isImplemented ? "outline" : "default"}
          disabled={isImplemented}
        >
          <span className="flex items-center gap-2">
            {isImplemented ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Já Implementado
              </>
            ) : (
              <>
                Começar Implementação
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </Button>
      </CardContent>
    </Card>
  );
};