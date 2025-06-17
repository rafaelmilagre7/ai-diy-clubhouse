
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModernAnalyticsHeader } from "@/components/admin/analytics/ModernAnalyticsHeader";
import { OverviewTabContent } from "@/components/admin/analytics/OverviewTabContent";
import { UserAnalyticsTabContent } from "@/components/admin/analytics/users/UserAnalyticsTabContent";
import { SolutionsAnalyticsTabContent } from "@/components/admin/analytics/solutions/SolutionsAnalyticsTabContent";
import { ImplementationsAnalyticsTabContent } from "@/components/admin/analytics/implementations/ImplementationsAnalyticsTabContent";
import { InsightsTabContent } from "@/components/admin/analytics/insights/InsightsTabContent";

const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  return (
    <div className="min-h-screen bg-[#0F111A] text-white">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <ModernAnalyticsHeader 
          timeRange={timeRange} 
          setTimeRange={setTimeRange}
          category={category}
          setCategory={setCategory}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />
        
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-800/50 px-6 pt-6">
              <TabsList className="grid w-full max-w-3xl grid-cols-5 bg-[#0F111A]/50 rounded-xl p-1 backdrop-blur-sm">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-[#00EAD9] data-[state=active]:text-black text-gray-400 transition-all duration-200 font-medium"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger 
                  value="insights"
                  className="data-[state=active]:bg-[#00EAD9] data-[state=active]:text-black text-gray-400 transition-all duration-200 font-medium"
                >
                  Insights
                </TabsTrigger>
                <TabsTrigger 
                  value="users"
                  className="data-[state=active]:bg-[#00EAD9] data-[state=active]:text-black text-gray-400 transition-all duration-200 font-medium"
                >
                  Usuários
                </TabsTrigger>
                <TabsTrigger 
                  value="solutions"
                  className="data-[state=active]:bg-[#00EAD9] data-[state=active]:text-black text-gray-400 transition-all duration-200 font-medium"
                >
                  Soluções
                </TabsTrigger>
                <TabsTrigger 
                  value="implementations"
                  className="data-[state=active]:bg-[#00EAD9] data-[state=active]:text-black text-gray-400 transition-all duration-200 font-medium"
                >
                  Implementações
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview" className="mt-0">
                <OverviewTabContent timeRange={timeRange} />
              </TabsContent>

              <TabsContent value="insights" className="mt-0 space-y-6">
                <InsightsTabContent timeRange={timeRange} />
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
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
