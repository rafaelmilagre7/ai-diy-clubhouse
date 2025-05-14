
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertTriangle, Users, CheckCircle2, Clock } from "lucide-react";
import { OnboardingOverviewSection } from './OnboardingOverviewSection';
import { UserPreferencesSection } from './UserPreferencesSection';
import { MarketInsightsSection } from './MarketInsightsSection';
import { SalesOpportunitiesSection } from './SalesOpportunitiesSection';
import { OnboardingProgress } from '@/types/onboarding';

export const OnboardingAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    abandonedSteps: [] as {step: string, count: number}[],
  });
  const [onboardingData, setOnboardingData] = useState<OnboardingProgress[]>([]);
  
  // Buscar dados do onboarding
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar todos os registros de onboarding
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('*, profiles:user_id(name, email, avatar_url, company_name)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setOnboardingData(data || []);
        
        // Calcular estatísticas
        const total = data?.length || 0;
        const completed = data?.filter(item => item.is_completed)?.length || 0;
        const inProgress = total - completed;
        
        // Identificar etapas abandonadas
        const stepCounts: Record<string, number> = {};
        data?.forEach(item => {
          if (!item.is_completed && item.current_step) {
            stepCounts[item.current_step] = (stepCounts[item.current_step] || 0) + 1;
          }
        });
        
        // Converter para array e ordenar
        const abandonedSteps = Object.entries(stepCounts)
          .map(([step, count]) => ({ step, count }))
          .sort((a, b) => b.count - a.count);
        
        setStats({
          total,
          completed,
          inProgress,
          abandonedSteps
        });
      } catch (error) {
        console.error("Erro ao carregar dados de onboarding:", error);
        toast.error("Erro ao carregar dados de análise");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Mapeamento legível das etapas
  const stepLabels: Record<string, string> = {
    'personal_info': 'Dados Pessoais',
    'professional_info': 'Dados Profissionais',
    'business_context': 'Contexto de Negócio',
    'ai_experience': 'Experiência com IA',
    'business_goals': 'Objetivos de Negócio',
    'experience_personalization': 'Personalização',
    'complementary_info': 'Informações Complementares',
    'review': 'Revisão',
    'completed': 'Finalizado'
  };

  // Componente para os cards de estatísticas
  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon 
  }: { 
    title: string; 
    value: string | number; 
    description: string;
    icon: React.ReactNode;
  }) => (
    <Card className="bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <h2 className="text-3xl font-bold mt-1">{value}</h2>
            <p className="text-sm text-gray-400 mt-2">{description}</p>
          </div>
          <div className="rounded-full bg-gray-700 p-2 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(null).map((_, i) => (
            <Card key={i} className="bg-gray-800">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 bg-gray-700 mb-2" />
                <Skeleton className="h-8 w-16 bg-gray-700 mb-4" />
                <Skeleton className="h-4 w-32 bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Onboardings"
            value={stats.total}
            description="Registros totais no sistema"
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="Onboardings Completos"
            value={stats.completed}
            description={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% de conclusão`}
            icon={<CheckCircle2 className="h-6 w-6" />}
          />
          <StatCard
            title="Em Andamento"
            value={stats.inProgress}
            description="Usuários com onboarding pendente"
            icon={<Clock className="h-6 w-6" />}
          />
          <StatCard
            title="Etapa Mais Abandonada"
            value={stats.abandonedSteps[0]?.step ? stepLabels[stats.abandonedSteps[0].step] || stats.abandonedSteps[0].step : "Nenhuma"}
            description={`${stats.abandonedSteps[0]?.count || 0} usuários pararam nesta etapa`}
            icon={<AlertTriangle className="h-6 w-6" />}
          />
        </div>
      )}

      {/* Abas de análise */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="market">Insights de Mercado</TabsTrigger>
          <TabsTrigger value="sales">Oportunidades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <OnboardingOverviewSection 
            isLoading={isLoading} 
            onboardingData={onboardingData}
            stats={stats}
          />
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <UserPreferencesSection
            isLoading={isLoading}
            onboardingData={onboardingData}
          />
        </TabsContent>
        
        <TabsContent value="market" className="space-y-6">
          <MarketInsightsSection
            isLoading={isLoading}
            onboardingData={onboardingData}
          />
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-6">
          <SalesOpportunitiesSection
            isLoading={isLoading}
            onboardingData={onboardingData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
