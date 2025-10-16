
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SolutionRecommendationCard } from './SolutionRecommendationCard';
import { Target } from 'lucide-react';

interface Recommendation {
  solutionId: string;
  justification: string;
  aiScore?: number;
  estimatedTime?: string;
}

interface PrioritySectionProps {
  title: string;
  subtitle: string;
  recommendations: Recommendation[];
  priority: number;
  accentColor: string;
  iconColor: string;
}

export const PrioritySection = ({
  title,
  subtitle,
  recommendations,
  priority,
  accentColor,
  iconColor,
}: PrioritySectionProps) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const getPriorityGradient = () => {
    const gradients = {
      1: "bg-gradient-to-r from-aurora-primary/20 via-aurora-primary/10 to-transparent",
      2: "bg-gradient-to-r from-[hsl(var(--vivercyan))]/20 via-[hsl(var(--vivercyan))]/10 to-transparent", 
      3: "bg-gradient-to-r from-[hsl(var(--viverpetrol))]/20 via-[hsl(var(--viverpetrol))]/10 to-transparent"
    };
    return gradients[priority as keyof typeof gradients] || gradients[3];
  };

  return (
    <div className="space-y-6">
      {/* Header da seção no estilo Netflix */}
      <div className="relative">
        <div className={`absolute inset-0 ${getPriorityGradient()} rounded-2xl blur-xl opacity-50`} />
        <Card className={`glass-dark border-2 ${accentColor} relative overflow-hidden backdrop-blur-sm`}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <Target className={`h-6 w-6 ${iconColor}`} />
              <div>
                <CardTitle className="text-high-contrast text-2xl font-bold">
                  {title}
                </CardTitle>
                <p className="text-medium-contrast text-lg mt-1">{subtitle}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Grid de cards no estilo Netflix */}
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <div
            key={`${priority}-${index}`}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <SolutionRecommendationCard
              recommendation={recommendation}
              priority={priority}
              iconColor={iconColor}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
