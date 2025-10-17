import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from '@/components/ui/chart';
import { OnboardingAnalyticsData } from '@/hooks/analytics/onboarding/useOnboardingAnalytics';

interface GoalsAndObjectivesChartsProps {
  data: OnboardingAnalyticsData['goalsAndObjectives'];
}

export const GoalsAndObjectivesCharts: React.FC<GoalsAndObjectivesChartsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Objetivos Principais */}
      <Card>
        <CardHeader>
          <CardTitle>Objetivos Principais</CardTitle>
          <CardDescription>
            Principais drivers de negócio dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.primaryGoalsDistribution.length > 0 ? (
            <BarChart
              data={data.primaryGoalsDistribution}
              categories={['value']}
              index="name"
              colors={['orange']}
              valueFormatter={(value) => `${value} usuários`}
              className="h-chart-md"
            />
          ) : (
            <div className="flex items-center justify-center h-chart-md">
              <p className="text-muted-foreground">Não há dados suficientes para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Áreas Prioritárias */}
      <Card>
        <CardHeader>
          <CardTitle>Áreas Prioritárias</CardTitle>
          <CardDescription>
            Onde focam os esforços de implementação de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.priorityAreasDistribution.length > 0 ? (
            <BarChart
              data={data.priorityAreasDistribution}
              categories={['value']}
              index="name"
              colors={['teal']}
              valueFormatter={(value) => `${value} menções`}
              className="h-chart-md"
            />
          ) : (
            <div className="flex items-center justify-center h-chart-md">
              <p className="text-muted-foreground">Não há dados suficientes para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capacidade de Investimento */}
      <Card>
        <CardHeader>
          <CardTitle>Capacidade de Investimento</CardTitle>
          <CardDescription>
            Budget disponível para soluções de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.investmentCapacityDistribution.length > 0 ? (
            <PieChart
              data={data.investmentCapacityDistribution}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} usuários`}
              className="h-chart-md"
            />
          ) : (
            <div className="flex items-center justify-center h-chart-md">
              <p className="text-muted-foreground">Não há dados suficientes para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline de Implementação */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Implementação</CardTitle>
          <CardDescription>
            Urgência de implementação das soluções
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.timelineDistribution.length > 0 ? (
            <PieChart
              data={data.timelineDistribution}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} usuários`}
              className="h-chart-md"
            />
          ) : (
            <div className="flex items-center justify-center h-chart-md">
              <p className="text-muted-foreground">Não há dados suficientes para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};