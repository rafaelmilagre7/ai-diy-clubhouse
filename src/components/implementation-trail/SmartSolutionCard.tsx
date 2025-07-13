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
    color: 'bg-red-500/10 text-red-700 border-red-200',
    icon: TrendingUp,
    description: 'Implementação imediata recomendada'
  },
  priority2: {
    label: 'Média Prioridade',
    color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    icon: Target,
    description: 'Implemente após as prioridades altas'
  },
  priority3: {
    label: 'Baixa Prioridade',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    icon: Sparkles,
    description: 'Planeje para médio prazo'
  }
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Fácil', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
  advanced: { label: 'Avançado', color: 'bg-red-100 text-red-800' }
};

const CATEGORY_CONFIG = {
  'Receita': { color: 'bg-emerald-100 text-emerald-800', icon: '💰' },
  'Marketing': { color: 'bg-purple-100 text-purple-800', icon: '📈' },
  'Operacional': { color: 'bg-blue-100 text-blue-800', icon: '⚙️' },
  'Automação': { color: 'bg-orange-100 text-orange-800', icon: '🤖' }
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
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Altamente Compatível';
    if (score >= 70) return 'Boa Compatibilidade';
    return 'Compatibilidade Moderada';
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg border-l-4 ${
      priority === 'priority1' ? 'border-l-red-500' : 
      priority === 'priority2' ? 'border-l-yellow-500' : 
      'border-l-blue-500'
    } ${isImplemented ? 'bg-gray-50' : ''}`}>
      {isImplemented && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Implementado
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={priorityConfig.color}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {priorityConfig.label}
              </Badge>
              
              {solution.category && (
                <Badge className={CATEGORY_CONFIG[solution.category]?.color || 'bg-gray-100 text-gray-800'}>
                  {CATEGORY_CONFIG[solution.category]?.icon} {solution.category}
                </Badge>
              )}
              
              <Badge className={DIFFICULTY_CONFIG[solution.difficulty]?.color || 'bg-gray-100 text-gray-800'}>
                {DIFFICULTY_CONFIG[solution.difficulty]?.label || solution.difficulty}
              </Badge>
            </div>

            <h3 className="font-semibold text-lg text-high-contrast mb-2">
              {solution.title}
            </h3>

            <p className="text-medium-contrast text-sm mb-3 line-clamp-2">
              {solution.description}
            </p>
          </div>

          {solution.thumbnail_url && (
            <div className="flex-shrink-0">
              <img 
                src={solution.thumbnail_url} 
                alt={solution.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Score de IA */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-medium-contrast">
              Compatibilidade IA
            </span>
            <span className={`text-lg font-bold ${getScoreColor(aiScore)}`}>
              {aiScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                aiScore >= 90 ? 'bg-green-500' : 
                aiScore >= 70 ? 'bg-yellow-500' : 
                'bg-orange-500'
              }`}
              style={{ width: `${aiScore}%` }}
            />
          </div>
          <p className={`text-xs mt-1 ${getScoreColor(aiScore)}`}>
            {getScoreLabel(aiScore)}
          </p>
        </div>

        {/* Justificativa personalizada */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-medium-contrast mb-1">
            Por que recomendamos:
          </h4>
          <p className="text-sm text-high-contrast bg-blue-50 p-2 rounded">
            {justification}
          </p>
        </div>

        {/* Tempo estimado */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-medium-contrast" />
          <span className="text-sm text-medium-contrast">
            Tempo estimado: <span className="font-medium text-high-contrast">{estimatedTime}</span>
          </span>
        </div>

        {/* Tags */}
        {solution.tags && solution.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {solution.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
              {solution.tags.length > 3 && (
                <span className="text-xs text-medium-contrast">
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