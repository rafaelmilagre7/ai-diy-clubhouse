
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsHeader } from "@/components/admin/analytics/AnalyticsHeader";
import { AnalyticsFilters } from "@/components/admin/analytics/AnalyticsFilters";
import { OverviewTabContent } from "@/components/admin/analytics/OverviewTabContent";
import { UserAnalyticsTabContent } from "@/components/admin/analytics/users/UserAnalyticsTabContent";
import { SolutionsAnalyticsTabContent } from "@/components/admin/analytics/solutions/SolutionsAnalyticsTabContent";
import { ImplementationsAnalyticsTabContent } from "@/components/admin/analytics/implementations/ImplementationsAnalyticsTabContent";
import { LmsAnalyticsTabContent } from "@/components/admin/analytics/lms/LmsAnalyticsTabContent";
import { PeriodComparison } from "@/components/admin/analytics/PeriodComparison";

const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  // Sample data for period comparison
  const comparisonData = [
    {
      metric: "Usuários Ativos",
      currentValue: 1250,
      previousValue: 980,
      format: "number" as const
    },
    {
      metric: "Soluções Implementadas", 
      currentValue: 85,
      previousValue: 72,
      format: "number" as const
    },
    {
      metric: "Taxa de Conclusão",
      currentValue: 68.5,
      previousValue: 62.3,
      format: "percentage" as const
    },
    {
      metric: "Receita Estimada",
      currentValue: 45000,
      previousValue: 38500,
      format: "currency" as const
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <AnalyticsHeader 
        timeRange={timeRange} 
        setTimeRange={setTimeRange}
        category={category}
        setCategory={setCategory}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filtros principais */}
        <div className="lg:w-80">
          <AnalyticsFilters 
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            category={category}
            setCategory={setCategory}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200/20 px-6 pt-6">
                <TabsList className="grid w-full grid-cols-5 bg-gray-100/50 backdrop-blur-sm rounded-xl p-1">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    Usuários
                  </TabsTrigger>
                  <TabsTrigger 
                    value="solutions"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    Soluções
                  </TabsTrigger>
                  <TabsTrigger 
                    value="implementations"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    Implementações
                  </TabsTrigger>
                  <TabsTrigger 
                    value="lms"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    LMS
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="overview" className="mt-0">
                  <OverviewTabContent timeRange={timeRange} />
                </TabsContent>

                <TabsContent value="users" className="mt-0 space-y-6">
                  <UserAnalyticsTabContent 
                    timeRange={timeRange}
                    role="all"
                  />
                </TabsContent>

                <TabsContent value="solutions" className="mt-0 space-y-6">
                  <SolutionsAnalyticsTabContent timeRange={timeRange} />
                </TabsContent>

                <TabsContent value="implementations" className="mt-0 space-y-6">
                  <ImplementationsAnalyticsTabContent timeRange={timeRange} />
                </TabsContent>

                <TabsContent value="lms" className="mt-0 space-y-6">
                  <LmsAnalyticsTabContent timeRange={timeRange} />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>

        {/* Comparação de período */}
        <div className="lg:w-80">
          <PeriodComparison
            title="Comparação de Período"
            currentPeriod="Últimos 30 dias"
            previousPeriod="30 dias anteriores"
            data={comparisonData}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
