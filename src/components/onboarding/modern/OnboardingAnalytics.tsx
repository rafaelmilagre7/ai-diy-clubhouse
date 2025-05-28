
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface OnboardingAnalyticsProps {
  analytics: {
    timeSpent: number;
    currentStepTime: number;
    errors: string[];
  };
  currentStep: number;
}

export const OnboardingAnalytics: React.FC<OnboardingAnalyticsProps> = ({
  analytics,
  currentStep
}) => {
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Analytics (Dev Mode)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Clock className="h-3 w-3 text-viverblue" />
          <span className="text-gray-300">
            Tempo total: {formatTime(analytics.timeSpent)}
          </span>
        </div>
        
        <div className="text-xs text-gray-400">
          Etapa atual: {currentStep} | Etapa tempo: {formatTime(analytics.currentStepTime)}
        </div>
        
        {analytics.errors.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="h-3 w-3" />
            <span>{analytics.errors.length} erros detectados</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
