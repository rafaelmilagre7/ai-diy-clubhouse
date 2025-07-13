
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, Clock, Target, Sparkles, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSolutionDataContext } from './contexts/SolutionDataContext';
import { useImageURL } from '@/hooks/useImageURL';

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

export const SolutionRecommendationCard = ({
  recommendation,
  priority,
  iconColor,
}: SolutionRecommendationCardProps) => {
  const navigate = useNavigate();
  const { solutions, loading, loadSolutions } = useSolutionDataContext();
  const { optimizeImageURL } = useImageURL();
  
  React.useEffect(() => {
    loadSolutions([recommendation.solutionId]);
  }, [recommendation.solutionId]);
  
  const solutionData = solutions[recommendation.solutionId];

  const handleViewSolution = () => {
    navigate(`/solution/${recommendation.solutionId}`);
  };

  const getPriorityBadge = () => {
    const badges = {
      1: { text: "Alta Prioridade", color: "bg-green-500/20 text-green-400 border-green-500/30" },
      2: { text: "Média Prioridade", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      3: { text: "Baixa Prioridade", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" }
    };
    return badges[priority as keyof typeof badges] || badges[3];
  };

  const getPriorityStars = () => {
    const starCount = priority === 1 ? 3 : priority === 2 ? 2 : 1;
    return Array.from({ length: starCount }, (_, i) => (
      <Star key={i} className="h-3 w-3 fill-current text-yellow-400" />
    ));
  };

  const badge = getPriorityBadge();

  if (loading) {
    return (
      <Card className="netflix-card-hover glass-dark border border-neutral-700/50 animate-pulse">
        <CardContent className="p-0">
          <div className="flex h-48">
            <div className="w-80 bg-neutral-800 rounded-l-xl"></div>
            <div className="flex-1 p-6 space-y-4">
              <div className="h-4 bg-neutral-700 rounded w-1/3"></div>
              <div className="h-6 bg-neutral-700 rounded w-2/3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-neutral-700 rounded"></div>
                <div className="h-3 bg-neutral-700 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="netflix-card-hover glass-dark border border-neutral-700/50 hover:border-viverblue/50 group relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 transition-all duration-300 hover:scale-[1.02]">
      {/* Gradient overlay para efeito Netflix */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-0 relative z-10">
        <div className="flex h-48">
          {/* Seção da imagem - estilo Netflix melhorado */}
          <div className="w-80 relative overflow-hidden rounded-l-xl bg-gradient-to-br from-neutral-800 to-neutral-900">
            {solutionData?.thumbnail_url ? (
              <>
                <img 
                  src={solutionData.thumbnail_url} 
                  alt={solutionData.title || 'Solução'}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-viverblue/20 to-purple-500/20">
                <div className="text-center">
                  <Zap className={`h-16 w-16 mx-auto mb-2 ${iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  <p className="text-xs text-medium-contrast">Solução IA</p>
                </div>
              </div>
            )}
            
            {/* Badge de prioridade sobreposto na imagem */}
            <div className="absolute top-4 left-4">
              <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${badge.color} backdrop-blur-sm`}>
                {badge.text}
              </span>
            </div>

            {/* Indicador de estrelas */}
            <div className="absolute bottom-4 left-4 flex gap-1">
              {getPriorityStars()}
            </div>
          </div>

          {/* Seção do conteúdo */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header com título e score */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-high-contrast group-hover:text-white transition-colors duration-200 line-clamp-2">
                    {solutionData?.title || 'Carregando...'}
                  </h3>
                  {solutionData?.category && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-medium-contrast capitalize">
                        {solutionData.category} • {solutionData.difficulty}
                      </p>
                      <Lightbulb className="h-3 w-3 text-viverblue" />
                    </div>
                  )}
                </div>
                
                {recommendation.aiScore && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-viverblue/10 rounded-lg border border-viverblue/20 group-hover:bg-viverblue/20 transition-colors duration-200 ml-4">
                    <Target className="h-4 w-4 text-viverblue" />
                    <span className="text-sm text-viverblue font-semibold">
                      {recommendation.aiScore}%
                    </span>
                    <Sparkles className="h-3 w-3 text-viverblue animate-pulse" />
                  </div>
                )}
              </div>

              {/* Justificativa */}
              <p className="text-high-contrast text-sm leading-relaxed group-hover:text-white transition-colors duration-200 line-clamp-3">
                {recommendation.justification}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-700/50">
              {recommendation.estimatedTime && (
                <div className="flex items-center gap-2 text-sm text-medium-contrast group-hover:text-high-contrast transition-colors duration-200">
                  <Clock className="h-4 w-4" />
                  <span>{recommendation.estimatedTime}</span>
                </div>
              )}
              
              <Button 
                size="sm" 
                onClick={handleViewSolution}
                className="bg-viverblue hover:bg-viverblue/90 text-white shadow-lg hover:shadow-viverblue/25 hover:shadow-xl group-hover:scale-105 transition-all duration-200 ml-auto"
              >
                Ver Solução
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
