import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, BarChart } from '@/components/ui/chart';
import { OnboardingAnalyticsData } from '@/hooks/analytics/onboarding/useOnboardingAnalytics';

interface AIExperienceChartsProps {
  data: OnboardingAnalyticsData['aiExperience'];
}

export const AIExperienceCharts: React.FC<AIExperienceChartsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Nível de Experiência */}
      <Card>
        <CardHeader>
          <CardTitle>Nível de Experiência com IA</CardTitle>
          <CardDescription>
            Maturidade dos usuários em inteligência artificial
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.experienceLevelDistribution.length > 0 ? (
            <PieChart
              data={data.experienceLevelDistribution}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} usuários`}
              className="h-[300px]"
            />
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Não há dados suficientes para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abordagem de Implementação */}
      <Card>
        <CardHeader>
          <CardTitle>Abordagem de Implementação</CardTitle>
          <CardDescription>
            Como pretendem implementar soluções de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.implementationApproachDistribution.length > 0 ? (
            <BarChart
              data={data.implementationApproachDistribution}
              categories={['value']}
              index="name"
              colors={['purple']}
              valueFormatter={(value) => `${value} usuários`}
              className="h-[300px]"
            />
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Não há dados suficientes para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status de Implementação */}
      <Card>
        <CardHeader>
          <CardTitle>Status de Implementação</CardTitle>
          <CardDescription>
            Estágio atual de adoção de IA nas empresas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.implementationStatusDistribution.length > 0 ? (
            <PieChart
              data={data.implementationStatusDistribution}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} usuários`}
              className="h-[300px]"
            />
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Não há dados suficientes para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};