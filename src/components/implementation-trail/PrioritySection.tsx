
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SolutionRecommendationCard } from './SolutionRecommendationCard';

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

  return (
    <Card className={`glass-dark border-2 ${accentColor}`}>
      <CardHeader>
        <CardTitle className="text-high-contrast text-xl">
          {title}
        </CardTitle>
        <p className="text-medium-contrast">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {recommendations.map((recommendation, index) => (
            <SolutionRecommendationCard
              key={`${priority}-${index}`}
              recommendation={recommendation}
              priority={priority}
              iconColor={iconColor}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
