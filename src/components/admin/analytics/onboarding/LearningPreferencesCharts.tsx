import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from '@/components/ui/chart';
import { OnboardingAnalyticsData } from '@/hooks/analytics/onboarding/useOnboardingAnalytics';

interface LearningPreferencesChartsProps {
  data: OnboardingAnalyticsData['learningPreferences'];
}

export const LearningPreferencesCharts: React.FC<LearningPreferencesChartsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tipos de Conteúdo Preferidos */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Conteúdo Preferidos</CardTitle>
          <CardDescription>
            Formatos de conteúdo mais demandados pelos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.contentTypeDistribution.length > 0 ? (
            <BarChart
              data={data.contentTypeDistribution}
              categories={['value']}
              index="name"
              colors={['indigo']}
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

      {/* Estilo de Aprendizado */}
      <Card>
        <CardHeader>
          <CardTitle>Estilo de Aprendizado</CardTitle>
          <CardDescription>
            Como os usuários preferem aprender
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.learningStyleDistribution.length > 0 ? (
            <PieChart
              data={data.learningStyleDistribution}
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

      {/* Disponibilidade de Tempo */}
      <Card>
        <CardHeader>
          <CardTitle>Disponibilidade de Tempo</CardTitle>
          <CardDescription>
            Melhor período para engajamento dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.availabilityDistribution.length > 0 ? (
            <PieChart
              data={data.availabilityDistribution}
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

      {/* Frequência de Comunicação */}
      <Card>
        <CardHeader>
          <CardTitle>Frequência de Comunicação</CardTitle>
          <CardDescription>
            Cadência ideal de contato com os usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.communicationFrequencyDistribution.length > 0 ? (
            <BarChart
              data={data.communicationFrequencyDistribution}
              categories={['value']}
              index="name"
              colors={['pink']}
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