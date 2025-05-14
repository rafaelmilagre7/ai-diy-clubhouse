
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { OnboardingProgress } from '@/types/onboarding';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StepStat {
  step: string;
  count: number;
}

interface Props {
  isLoading: boolean;
  onboardingData: OnboardingProgress[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    abandonedSteps: StepStat[];
  };
}

// Mapeamento de nomes legíveis para os passos do onboarding
const STEP_NAMES: Record<string, string> = {
  'personal_info': 'Dados Pessoais',
  'professional_info': 'Dados Profissionais',
  'business_context': 'Contexto de Negócio',
  'ai_experience': 'Experiência com IA',
  'business_goals': 'Objetivos de Negócio',
  'experience_personalization': 'Personalização',
  'complementary_info': 'Informações Complementares',
  'review': 'Revisão',
  'completed': 'Finalizado',
  // Compatibilidade com IDs anteriores
  'personal': 'Dados Pessoais',
  'professional_data': 'Dados Profissionais',
  'ai_exp': 'Experiência com IA',
  'complementary': 'Informações Complementares',
  'trail_generation': 'Geração da Trilha'
};

export const OnboardingOverviewSection: React.FC<Props> = ({ isLoading, onboardingData, stats }) => {
  // Dados para o gráfico de conclusão
  const completionData = useMemo(() => [
    { name: "Completos", value: stats.completed },
    { name: "Incompletos", value: stats.inProgress }
  ], [stats.completed, stats.inProgress]);
  
  // Cores para o gráfico de pizza
  const COLORS = ['#10b981', '#6b7280'];
  
  // Dados para o gráfico de passos concluídos
  const stepDistribution = useMemo(() => {
    if (!onboardingData?.length) return [];
    
    // Contador para cada etapa (incluindo etapas concluídas)
    const stepCounts: Record<string, number> = {};
    
    onboardingData.forEach(item => {
      // Registrar o passo atual
      if (item.current_step) {
        stepCounts[item.current_step] = (stepCounts[item.current_step] || 0) + 1;
      }
      
      // Registrar os passos completados
      if (Array.isArray(item.completed_steps)) {
        item.completed_steps.forEach(step => {
          stepCounts[step] = (stepCounts[step] || 0) + 1;
        });
      }
    });
    
    // Transformar em formato para o gráfico e ordenar
    return Object.entries(stepCounts)
      .map(([step, count]) => ({
        name: STEP_NAMES[step] || step,
        Usuários: count
      }))
      .sort((a, b) => b.Usuários - a.Usuários);
  }, [onboardingData]);
  
  // Lista de usuários recentes que completaram o onboarding
  const recentCompletions = useMemo(() => {
    return onboardingData
      .filter(item => item.is_completed)
      .sort((a, b) => new Date(b.updated_at as string).getTime() - new Date(a.updated_at as string).getTime())
      .slice(0, 10);
  }, [onboardingData]);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    if (diffSecs < 60) return `${diffSecs} segundos atrás`;
    if (diffMins < 60) return `${diffMins} minutos atrás`;
    if (diffHours < 24) return `${diffHours} horas atrás`;
    return `${diffDays} dias atrás`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="bg-gray-800">
            <CardHeader>
              <Skeleton className="h-5 w-48 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full bg-gray-700" />
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800">
            <CardHeader>
              <Skeleton className="h-5 w-48 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full bg-gray-700" />
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-gray-800">
          <CardHeader>
            <Skeleton className="h-5 w-48 bg-gray-700" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-5 w-32 bg-gray-700" />
                <Skeleton className="h-3 w-full max-w-xs bg-gray-700 mx-4" />
                <Skeleton className="h-5 w-16 bg-gray-700" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Taxa de conclusão por etapa
  const stepCompletionRate = stats.total > 0 ? onboardingData
    .flatMap(item => Array.isArray(item.completed_steps) ? item.completed_steps : [])
    .reduce((acc: {[key: string]: number}, step) => {
      acc[step] = (acc[step] || 0) + 1;
      return acc;
    }, {}) : {};

  // Transformar em formato para exibição
  const stepRateData = Object.entries(stepCompletionRate)
    .map(([step, count]) => ({
      step: STEP_NAMES[step] || step,
      percentComplete: Math.round((count / stats.total) * 100)
    }))
    .sort((a, b) => a.percentComplete - b.percentComplete);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Gráfico de Pizza - Status de Conclusão */}
        <Card className="bg-gray-800">
          <CardHeader>
            <CardTitle>Status de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} usuários`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Distribuição por Etapas */}
        <Card className="bg-gray-800">
          <CardHeader>
            <CardTitle>Distribuição por Etapas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stepDistribution}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 60,
                    bottom: 5,
                  }}
                >
                  <XAxis type="number" />
                  <YAxis type="category" width={100} dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Usuários" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taxas de Conclusão por Etapa */}
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle>Taxa de Conclusão por Etapa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stepRateData.map((item) => (
            <div key={item.step}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{item.step}</span>
                <span className="text-sm font-medium">{item.percentComplete}%</span>
              </div>
              <Progress value={item.percentComplete} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Conclusões Recentes */}
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle>Conclusões Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCompletions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum onboarding concluído recentemente
            </div>
          ) : (
            <ScrollArea className="h-[300px] w-full pr-4">
              <div className="space-y-4">
                {recentCompletions.map((item, index) => {
                  // @ts-ignore - Acessando dados relacionados
                  const profile = item.profiles || {};
                  
                  return (
                    <div key={index} className="flex items-start justify-between border-b border-gray-700 pb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden mr-3">
                          {/* @ts-ignore - Acessando dados relacionados */}
                          {profile.avatar_url ? (
                            <img 
                              // @ts-ignore
                              src={profile.avatar_url} 
                              alt="" 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                              {/* @ts-ignore */}
                              {profile.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div>
                          {/* @ts-ignore */}
                          <p className="font-medium">{profile.name || 'Usuário'}</p>
                          <p className="text-sm text-gray-400">
                            {/* @ts-ignore */}
                            {profile.company_name || profile.email || 'Sem detalhes'}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatTimeAgo(item.updated_at as string)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
