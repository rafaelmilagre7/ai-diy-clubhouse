
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, BarChart } from '@/components/ui/chart';
import { OnboardingAnalyticsData } from '@/hooks/admin/useOnboardingAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MarketInsightsSectionProps {
  data: OnboardingAnalyticsData;
}

export const MarketInsightsSection: React.FC<MarketInsightsSectionProps> = ({ data }) => {
  const { sectorDistribution, companySizeDistribution, businessGoalsDistribution, aiExperienceDistribution } = data;
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="sectors" className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="sectors">Setores</TabsTrigger>
          <TabsTrigger value="company-size">Tamanho da Empresa</TabsTrigger>
          <TabsTrigger value="business-goals">Objetivos de Negócio</TabsTrigger>
          <TabsTrigger value="ai-experience">Experiência com IA</TabsTrigger>
        </TabsList>

        <TabsContent value="sectors">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Setor</CardTitle>
              <CardDescription>Análise dos setores das empresas dos membros</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {sectorDistribution.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4 h-full">
                  <div className="h-full flex items-center justify-center">
                    <PieChart 
                      data={sectorDistribution.slice(0, 7)} // Limitar aos 7 maiores para melhor visualização
                      category="value"
                      index="name"
                      valueFormatter={(value) => `${value} empresas`}
                      className="h-full"
                    />
                  </div>
                  <div>
                    <BarChart 
                      data={sectorDistribution.slice(0, 10)} // Top 10
                      categories={['value']}
                      index="name"
                      valueFormatter={(value) => `${value} empresas`}
                      className="h-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Sem dados de setores suficientes para análise</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company-size">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tamanho da Empresa</CardTitle>
              <CardDescription>Análise do porte das empresas dos membros</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {companySizeDistribution.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4 h-full">
                  <div className="h-full flex items-center justify-center">
                    <PieChart 
                      data={companySizeDistribution} 
                      category="value"
                      index="name"
                      valueFormatter={(value) => `${value} empresas`}
                      className="h-full"
                    />
                  </div>
                  <div>
                    <BarChart 
                      data={companySizeDistribution}
                      categories={['value']}
                      index="name"
                      valueFormatter={(value) => `${value} empresas`}
                      className="h-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Sem dados de tamanho de empresa suficientes para análise</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-goals">
          <Card>
            <CardHeader>
              <CardTitle>Principais Objetivos de Negócio</CardTitle>
              <CardDescription>Análise dos objetivos relatados pelos membros</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {businessGoalsDistribution.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4 h-full">
                  <div className="h-full flex items-center justify-center">
                    <PieChart 
                      data={businessGoalsDistribution} 
                      category="value"
                      index="name"
                      valueFormatter={(value) => `${value} membros`}
                      className="h-full"
                    />
                  </div>
                  <div>
                    <BarChart 
                      data={businessGoalsDistribution}
                      categories={['value']}
                      index="name"
                      valueFormatter={(value) => `${value} membros`}
                      className="h-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Sem dados de objetivos de negócio suficientes para análise</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-experience">
          <Card>
            <CardHeader>
              <CardTitle>Experiência com IA</CardTitle>
              <CardDescription>Nível de experiência com IA dos membros</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {aiExperienceDistribution.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4 h-full">
                  <div className="h-full flex items-center justify-center">
                    <PieChart 
                      data={aiExperienceDistribution} 
                      category="value"
                      index="name"
                      valueFormatter={(value) => `${value} membros`}
                      className="h-full"
                    />
                  </div>
                  <div>
                    <BarChart 
                      data={aiExperienceDistribution}
                      categories={['value']}
                      index="name"
                      valueFormatter={(value) => `${value} membros`}
                      className="h-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Sem dados de experiência com IA suficientes para análise</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
