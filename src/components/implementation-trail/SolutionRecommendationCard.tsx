
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, Clock, Target } from 'lucide-react';
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
    <Card className="glass-dark border border-neutral-700 hover:border-viverblue/50 transition-all duration-300 hover:shadow-lg hover:shadow-viverblue/25 group">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`p-2 bg-viverblue/20 rounded-lg group-hover:bg-viverblue/30 transition-colors`}>
            <Lightbulb className={`h-5 w-5 ${iconColor}`} />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full border ${badge.color}`}>
                {badge.text}
              </span>
              {recommendation.aiScore && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-viverblue" />
                  <span className="text-xs text-viverblue font-medium">
                    {recommendation.aiScore}% match
                  </span>
                </div>
              )}
            </div>

            <p className="text-high-contrast text-sm leading-relaxed">
              {recommendation.justification}
            </p>

            <div className="flex items-center justify-between pt-2">
              {recommendation.estimatedTime && (
                <div className="flex items-center gap-1 text-xs text-medium-contrast">
                  <Clock className="h-3 w-3" />
                  <span>{recommendation.estimatedTime}</span>
                </div>
              )}
              
              <Button 
                size="sm" 
                onClick={handleViewSolution}
                className="bg-viverblue hover:bg-viverblue/90 text-white"
              >
                Ver Solução
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
