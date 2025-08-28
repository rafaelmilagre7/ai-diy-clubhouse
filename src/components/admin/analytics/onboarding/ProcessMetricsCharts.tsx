import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, AreaChart } from '@/components/ui/chart';
import { OnboardingAnalyticsData } from '@/hooks/analytics/onboarding/useOnboardingAnalytics';

interface ProcessMetricsChartsProps {
  data: OnboardingAnalyticsData['processMetrics'];
}

export const ProcessMetricsCharts: React.FC<ProcessMetricsChartsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Funil de Abandono */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Funil de Onboarding</CardTitle>
          <CardDescription>
            Progressão dos usuários através das etapas do onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.funnelData.length > 0 ? (
            <div className="space-y-4">
              {data.funnelData.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{step.step}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {step.users} usuários ({step.percentage}%)
                      </span>
                      {step.dropoffRate > 0 && (
                        <span className="text-xs text-red-500">
                          -{step.dropoffRate}% abandono
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-operational to-strategy h-3 rounded-full transition-all duration-300"
                      style={{ width: `${step.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Não há dados suficientes para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tempo de Conclusão */}
      <Card>
        <CardHeader>
          <CardTitle>Tempo de Conclusão</CardTitle>
          <CardDescription>
            Distribuição do tempo para completar o onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.completionTimeDistribution.length > 0 ? (
            <BarChart
              data={data.completionTimeDistribution}
              categories={['count']}
              index="range"
              colors={['emerald']}
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

      {/* Tendências Semanais */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Tendências de Conclusão</CardTitle>
          <CardDescription>
            Evolução semanal dos onboardings iniciados vs concluídos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.weeklyTrends.length > 0 ? (
            <AreaChart
              data={data.weeklyTrends}
              categories={['started', 'completed']}
              index="week"
              colors={['blue', 'green']}
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