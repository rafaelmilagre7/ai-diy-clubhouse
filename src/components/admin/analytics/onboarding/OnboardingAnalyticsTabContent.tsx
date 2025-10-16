import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Users, TrendingUp, Target, Clock, BarChart3 } from 'lucide-react';
import { useOnboardingAnalytics } from '@/hooks/analytics/onboarding/useOnboardingAnalytics';
import { AnalyticsTabContainer, AnalyticsMetricsGrid, AnalyticsChartsGrid } from '../components/AnalyticsTabContainer';
import { ProfessionalInfoCharts } from './ProfessionalInfoCharts';
import { AIExperienceCharts } from './AIExperienceCharts';
import { GoalsAndObjectivesCharts } from './GoalsAndObjectivesCharts';
import { LearningPreferencesCharts } from './LearningPreferencesCharts';
import { ProcessMetricsCharts } from './ProcessMetricsCharts';

interface OnboardingAnalyticsTabContentProps {
  timeRange: string;
}

export const OnboardingAnalyticsTabContent: React.FC<OnboardingAnalyticsTabContentProps> = ({ timeRange }) => {
  const { data, isLoading, error } = useOnboardingAnalytics(timeRange);

  if (isLoading) {
    return (
      <AnalyticsTabContainer>
        {/* Overview Cards Skeleton */}
        <AnalyticsMetricsGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </AnalyticsMetricsGrid>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </AnalyticsTabContainer>
    );
  }

  if (error || !data) {
    return (
      <AnalyticsTabContainer>
        <Alert className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-neutral-800 dark:text-white">Erro ao carregar dados</AlertTitle>
          <AlertDescription className="text-neutral-700 dark:text-neutral-300">
            Não foi possível carregar os dados de analytics do onboarding. Tente novamente.
          </AlertDescription>
        </Alert>
      </AnalyticsTabContainer>
    );
  }

  const overviewMetrics = [
    {
      title: "Total de Usuários",
      value: data.overview.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-operational"
    },
    {
      title: "Taxa de Conclusão",
      value: `${data.overview.completionRate}%`,
      icon: Target,
      color: "text-green-500"
    },
    {
      title: "Taxa de Abandono",
      value: `${data.overview.abandonmentRate}%`,
      icon: TrendingUp,
      color: "text-red-500"
    },
    {
      title: "Tempo Médio (dias)",
      value: data.overview.averageCompletionTime.toString(),
      icon: Clock,
      color: "text-purple-500"
    }
  ];

  return (
    <AnalyticsTabContainer>
      {/* Overview Metrics */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-operational/10">
            <BarChart3 className="h-5 w-5 text-operational" />
          </div>
          <div>
            <h2 className="text-heading-3">Métricas Gerais do Onboarding</h2>
            <p className="text-body-small text-muted-foreground">
              Visão geral do desempenho do processo de onboarding
            </p>
          </div>
        </div>

        <AnalyticsMetricsGrid>
          {overviewMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <IconComponent className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </AnalyticsMetricsGrid>
      </div>

      {/* Professional Information Charts */}
      <div className="space-y-6">
        <div>
          <h3 className="text-heading-4 mb-4">Informações Profissionais</h3>
          <ProfessionalInfoCharts data={data.professionalInfo} />
        </div>

        {/* AI Experience Charts */}
        <div>
          <h3 className="text-heading-4 mb-4">Experiência com IA</h3>
          <AIExperienceCharts data={data.aiExperience} />
        </div>

        {/* Goals and Objectives Charts */}
        <div>
          <h3 className="text-heading-4 mb-4">Objetivos e Metas</h3>
          <GoalsAndObjectivesCharts data={data.goalsAndObjectives} />
        </div>

        {/* Learning Preferences Charts */}
        <div>
          <h3 className="text-heading-4 mb-4">Preferências de Aprendizado</h3>
          <LearningPreferencesCharts data={data.learningPreferences} />
        </div>

        {/* Process Metrics Charts */}
        <div>
          <h3 className="text-heading-4 mb-4">Métricas do Processo</h3>
          <ProcessMetricsCharts data={data.processMetrics} />
        </div>
      </div>
    </AnalyticsTabContainer>
  );
};