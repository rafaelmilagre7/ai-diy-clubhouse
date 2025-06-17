
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTabContent } from '@/components/admin/analytics/OverviewTabContent';
import { UserAnalyticsTabContent } from '@/components/admin/analytics/users/UserAnalyticsTabContent';
import { SolutionsAnalyticsTabContent } from '@/components/admin/analytics/solutions/SolutionsAnalyticsTabContent';
import { ImplementationsAnalyticsTabContent } from '@/components/admin/analytics/implementations/ImplementationsAnalyticsTabContent';
import { LmsAnalyticsTabContent } from '@/components/admin/analytics/lms/LmsAnalyticsTabContent';
import { AdvancedFilters } from '@/components/admin/analytics/AdvancedFilters';
import { PeriodComparison } from '@/components/admin/analytics/PeriodComparison';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Target, 
  GraduationCap,
  Download,
  RefreshCw,
  Settings,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [role, setRole] = useState('all');
  const [showComparison, setShowComparison] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: BarChart3,
      description: 'Resumo executivo de todos os dados'
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      description: 'Analytics de usuários e engagement'
    },
    {
      id: 'solutions',
      label: 'Soluções',
      icon: BookOpen,
      description: 'Performance das soluções'
    },
    {
      id: 'implementations',
      label: 'Implementações',
      icon: Target,
      description: 'Progresso das implementações'
    },
    {
      id: 'lms',
      label: 'LMS',
      icon: GraduationCap,
      description: 'Analytics do sistema de aprendizado'
    }
  ];

  const mockComparisonData = [
    {
      metric: 'Total de Usuários',
      currentValue: 1247,
      previousValue: 1156,
      format: 'number' as const
    },
    {
      metric: 'Usuários Ativos',
      currentValue: 892,
      previousValue: 756,
      format: 'number' as const
    },
    {
      metric: 'Taxa de Engajamento',
      currentValue: 68.5,
      previousValue: 61.2,
      format: 'percentage' as const
    },
    {
      metric: 'Implementações Concluídas',
      currentValue: 234,
      previousValue: 198,
      format: 'number' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header moderno */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 text-lg">
              Insights avançados e métricas de performance da plataforma VIVER DE IA
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
              className={cn(
                "border-slate-200 hover:border-slate-300",
                showComparison && "bg-blue-50 border-blue-200 text-blue-700"
              )}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Comparar Períodos
            </Button>
            
            <Button variant="outline" className="border-slate-200 hover:border-slate-300">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            
            <Button variant="outline" className="border-slate-200 hover:border-slate-300">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            
            <Button variant="outline" size="icon" className="border-slate-200 hover:border-slate-300">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filtros avançados */}
        <AdvancedFilters
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          category={category}
          setCategory={setCategory}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          role={role}
          setRole={setRole}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
        />

        {/* Layout principal com comparação */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Área principal de conteúdo */}
          <div className={cn("space-y-6", showComparison ? "lg:col-span-3" : "lg:col-span-4")}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Navegação por abas estilizada */}
              <div className="relative">
                <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border-0 shadow-xl p-2 h-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300",
                          "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500",
                          "data-[state=active]:text-white data-[state=active]:shadow-lg",
                          "hover:bg-slate-50 hover:scale-105"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <div className="text-center">
                          <div className="font-medium text-sm">{tab.label}</div>
                          <div className="text-xs opacity-70 hidden md:block mt-1">
                            {tab.description}
                          </div>
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {/* Conteúdo das abas */}
              <TabsContent value="overview" className="space-y-6">
                <OverviewTabContent 
                  timeRange={timeRange} 
                  category={category} 
                  difficulty={difficulty} 
                />
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <UserAnalyticsTabContent 
                  timeRange={timeRange} 
                  role={role} 
                />
              </TabsContent>

              <TabsContent value="solutions" className="space-y-6">
                <SolutionsAnalyticsTabContent 
                  timeRange={timeRange} 
                  category={category} 
                  difficulty={difficulty} 
                />
              </TabsContent>

              <TabsContent value="implementations" className="space-y-6">
                <ImplementationsAnalyticsTabContent 
                  timeRange={timeRange} 
                />
              </TabsContent>

              <TabsContent value="lms" className="space-y-6">
                <LmsAnalyticsTabContent 
                  timeRange={timeRange} 
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Painel de comparação lateral */}
          {showComparison && (
            <div className="lg:col-span-1 space-y-6">
              <PeriodComparison
                title="Comparação de Períodos"
                currentPeriod="Período Atual"
                previousPeriod="Período Anterior"
                data={mockComparisonData}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
