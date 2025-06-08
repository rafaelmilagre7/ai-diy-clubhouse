
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  Clock, 
  Lightbulb, 
  ArrowRight,
  HelpCircle,
  Percent
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface Recommendation {
  solutionId: string;
  justification: string;
  aiScore?: number;
  estimatedTime?: string;
}

interface SolutionRecommendationCardProps {
  recommendation: Recommendation;
  priority: number;
  iconColor: string;
}

interface Solution {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  slug: string;
}

export const SolutionRecommendationCard = ({
  recommendation,
  priority,
  iconColor,
}: SolutionRecommendationCardProps) => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullJustification, setShowFullJustification] = useState(false);

  useEffect(() => {
    const loadSolution = async () => {
      try {
        const { data, error } = await supabase
          .from('solutions')
          .select('*')
          .eq('id', recommendation.solutionId)
          .single();

        if (error) {
          console.error('Erro ao carregar solução:', error);
          return;
        }

        setSolution(data);
      } catch (error) {
        console.error('Erro ao carregar solução:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSolution();
  }, [recommendation.solutionId]);

  if (isLoading) {
    return (
      <Card className="glass-dark animate-pulse">
        <CardContent className="p-4">
          <div className="h-6 bg-neutral-700 rounded mb-2"></div>
          <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
        </CardContent>
      </Card>
    );
  }

  if (!solution) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  return (
    <Card className="glass-dark hover:bg-neutral-800/50 transition-all duration-200 border border-neutral-700 hover:border-viverblue/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className={`h-5 w-5 ${iconColor}`} />
              <h3 className="text-high-contrast font-semibold text-lg">
                {solution.title}
              </h3>
              {recommendation.aiScore && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  {Math.round(recommendation.aiScore)}% match
                </Badge>
              )}
            </div>

            <p className="text-medium-contrast text-sm mb-3 line-clamp-2">
              {solution.description}
            </p>

            <div className="flex items-center gap-3 mb-4">
              <Badge className={getDifficultyColor(solution.difficulty)}>
                {getDifficultyLabel(solution.difficulty)}
              </Badge>
              {recommendation.estimatedTime && (
                <div className="flex items-center gap-1 text-sm text-medium-contrast">
                  <Clock className="h-4 w-4" />
                  {recommendation.estimatedTime}
                </div>
              )}
            </div>

            <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-viverblue mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-viverblue mb-1">
                    Por que esta solução é ideal para você:
                  </p>
                  <p className="text-sm text-high-contrast">
                    {showFullJustification 
                      ? recommendation.justification
                      : `${recommendation.justification.substring(0, 150)}${recommendation.justification.length > 150 ? '...' : ''}`
                    }
                  </p>
                  {recommendation.justification.length > 150 && (
                    <button
                      onClick={() => setShowFullJustification(!showFullJustification)}
                      className="text-viverblue text-xs hover:underline mt-1"
                    >
                      {showFullJustification ? 'Ver menos' : 'Ver mais'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link to={`/solution/${solution.id}`}>
              <Button size="sm" className="bg-viverblue hover:bg-viverblue/90">
                Ver Detalhes
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to={`/implement/${solution.id}/0`}>
              <Button size="sm" variant="outline" className="border-viverblue/20 hover:bg-viverblue/10">
                Implementar
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
