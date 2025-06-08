
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, Clock, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  const badge = getPriorityBadge();

  return (
    <Card className="netflix-card-hover glass-dark border border-neutral-700/50 hover:border-viverblue/50 group relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-neutral-900/90 to-neutral-800/90">
      {/* Gradient overlay para efeito Netflix */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className={`p-3 bg-viverblue/20 rounded-xl group-hover:bg-viverblue/30 transition-all duration-300 group-hover:scale-110`}>
            <Lightbulb className={`h-6 w-6 ${iconColor} group-hover:drop-shadow-lg transition-all duration-300`} />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${badge.color} group-hover:scale-105 transition-transform duration-200`}>
                {badge.text}
              </span>
              {recommendation.aiScore && (
                <div className="flex items-center gap-2 px-2 py-1 bg-viverblue/10 rounded-lg border border-viverblue/20 group-hover:bg-viverblue/20 transition-colors duration-200">
                  <Target className="h-4 w-4 text-viverblue" />
                  <span className="text-sm text-viverblue font-semibold">
                    {recommendation.aiScore}% match
                  </span>
                  <Sparkles className="h-3 w-3 text-viverblue animate-pulse" />
                </div>
              )}
            </div>

            <p className="text-high-contrast text-sm leading-relaxed group-hover:text-white transition-colors duration-200">
              {recommendation.justification}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-700/50">
              {recommendation.estimatedTime && (
                <div className="flex items-center gap-2 text-sm text-medium-contrast group-hover:text-high-contrast transition-colors duration-200">
                  <Clock className="h-4 w-4" />
                  <span>{recommendation.estimatedTime}</span>
                </div>
              )}
              
              <Button 
                size="sm" 
                onClick={handleViewSolution}
                className="bg-viverblue hover:bg-viverblue/90 text-white shadow-lg hover:shadow-viverblue/25 hover:shadow-xl group-hover:scale-105 transition-all duration-200"
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
