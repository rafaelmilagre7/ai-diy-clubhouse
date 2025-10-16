
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, Clock, Target, Zap, Star, Award, TrendingUp } from 'lucide-react';
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
      1: { text: "Alta Prioridade", color: "bg-viverblue/20 text-viverblue border-viverblue/30" },
      2: { text: "Média Prioridade", color: "bg-[hsl(var(--vivercyan))]/20 text-[hsl(var(--vivercyan))] border-[hsl(var(--vivercyan))]/30" },
      3: { text: "Baixa Prioridade", color: "bg-[hsl(var(--viverpetrol))]/20 text-[hsl(var(--viverpetrol-light))] border-[hsl(var(--viverpetrol))]/30" }
    };
    return badges[priority as keyof typeof badges] || badges[3];
  };

  const getPriorityStars = () => {
    const starCount = priority === 1 ? 3 : priority === 2 ? 2 : 1;
    return Array.from({ length: starCount }, (_, i) => (
      <Star key={i} className="h-3 w-3 fill-current text-viverblue" />
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
    <Card className="group relative overflow-hidden border border-border/50 hover:border-viverblue/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-viverblue/10 bg-gradient-to-br from-card/95 to-muted/95 backdrop-blur-md">
      {/* Efeito de brilho animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-viverblue/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-viverblue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Particles effect background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-viverblue rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-[hsl(var(--vivercyan))] rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
        <div className="absolute bottom-1/3 left-2/3 w-1 h-1 bg-[hsl(var(--viverpetrol))] rounded-full animate-pulse" style={{animationDelay: '0.8s'}} />
      </div>
      
      <CardContent className="p-0 relative z-10">
        <div className="flex h-48">
          {/* Seção da imagem com efeitos avançados */}
          <div className="w-80 relative overflow-hidden rounded-l-xl bg-gradient-to-br from-muted to-muted/50">
            {solutionData?.thumbnail_url ? (
              <>
                <img 
                  src={solutionData.thumbnail_url} 
                  alt={solutionData.title || 'Solução'}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:rotate-1"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                
                {/* Efeito de scan line */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-viverblue/20 to-transparent h-8 translate-y-[-100%] group-hover:translate-y-[300%] transition-transform duration-1500 ease-out" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-viverblue/20 to-[hsl(var(--vivercyan))]/20 relative">
                {/* Animated orb background */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-viverblue/10 rounded-full blur-xl animate-pulse" />
                  <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-[hsl(var(--vivercyan))]/10 rounded-full blur-lg animate-pulse animation-delay-1000" />
                </div>
                
                <div className="text-center relative z-10">
                  <Zap className={`h-16 w-16 mx-auto mb-2 ${iconColor} group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`} />
                  <p className="text-xs text-muted-foreground font-medium">Solução IA</p>
                </div>
              </div>
            )}
            
            {/* Badge de prioridade com efeito glass */}
            <div className="absolute top-4 left-4">
              <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${badge.color} backdrop-blur-md shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                <span className="relative z-10">{badge.text}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </span>
            </div>

            {/* Indicador de estrelas com animação */}
            <div className="absolute bottom-4 left-4 flex gap-1">
              {getPriorityStars().map((star, index) => (
                <div key={index} className="animate-pulse" style={{animationDelay: `${index * 200}ms`}}>
                  {star}
                </div>
              ))}
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
                  <div className="flex items-center gap-2 px-3 py-2 bg-viverblue/10 rounded-lg border border-viverblue/20 group-hover:bg-viverblue/20 group-hover:scale-105 transition-all duration-300 ml-4 relative overflow-hidden">
                    {/* Progress fill animation */}
                    <div 
                      className="absolute left-0 top-0 h-full bg-viverblue/5 transition-all duration-1000 group-hover:bg-viverblue/10"
                      style={{width: `${recommendation.aiScore}%`}}
                    />
                    <Target className="h-4 w-4 text-viverblue relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-sm text-viverblue font-semibold relative z-10">
                      {recommendation.aiScore}%
                    </span>
                    <Award className="h-3 w-3 text-viverblue relative z-10 group-hover:scale-125 transition-transform duration-300" />
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
                className="bg-viverblue hover:bg-viverblue/90 text-white shadow-lg hover:shadow-viverblue/25 hover:shadow-xl group-hover:scale-110 transition-all duration-300 ml-auto relative overflow-hidden"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10">Ver Solução</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
