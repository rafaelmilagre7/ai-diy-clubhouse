
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from '@/components/ui/chart';
import { OnboardingAnalyticsData } from '@/hooks/admin/useOnboardingAnalytics';

interface UserPreferencesSectionProps {
  data: OnboardingAnalyticsData;
}

export const UserPreferencesSection: React.FC<UserPreferencesSectionProps> = ({ data }) => {
  const { contentPreferencesDistribution, weekdayAvailability } = data;
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Preferências de Conteúdo</CardTitle>
            <CardDescription>Formatos preferidos pelos membros</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {contentPreferencesDistribution.length > 0 ? (
              <PieChart 
                data={contentPreferencesDistribution} 
                category="value"
                index="name"
                valueFormatter={(value) => `${value} membros`}
                className="h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Sem dados suficientes sobre preferências de conteúdo</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Disponibilidade Semanal</CardTitle>
            <CardDescription>Dias da semana com maior disponibilidade</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <BarChart 
              data={weekdayAvailability}
              categories={['atividade']}
              index="name"
              colors={['blue']}
              valueFormatter={(value) => `${value} membros`}
              className="h-[300px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
