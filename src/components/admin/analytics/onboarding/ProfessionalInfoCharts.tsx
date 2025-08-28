import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from '@/components/ui/chart';
import { OnboardingAnalyticsData } from '@/hooks/analytics/onboarding/useOnboardingAnalytics';

interface ProfessionalInfoChartsProps {
  data: OnboardingAnalyticsData['professionalInfo'];
}

export const ProfessionalInfoCharts: React.FC<ProfessionalInfoChartsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Setor Empresarial */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Setor</CardTitle>
          <CardDescription>
            Setores empresariais dos usuários da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.sectorDistribution.length > 0 ? (
            <BarChart
              data={data.sectorDistribution}
              categories={['value']}
              index="name"
              colors={['blue']}
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

      {/* Tamanho da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Tamanho das Empresas</CardTitle>
          <CardDescription>
            Distribuição por número de funcionários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.companySizeDistribution.length > 0 ? (
            <PieChart
              data={data.companySizeDistribution}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} empresas`}
              className="h-[300px]"
            />
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Não há dados suficientes para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cargos/Posições */}
      <Card>
        <CardHeader>
          <CardTitle>Cargos dos Usuários</CardTitle>
          <CardDescription>
            Posições hierárquicas dos decision makers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.positionDistribution.length > 0 ? (
            <BarChart
              data={data.positionDistribution}
              categories={['value']}
              index="name"
              colors={['green']}
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

      {/* Faturamento Anual */}
      <Card>
        <CardHeader>
          <CardTitle>Faturamento das Empresas</CardTitle>
          <CardDescription>
            Capacidade financeira das empresas usuárias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.revenueDistribution.length > 0 ? (
            <PieChart
              data={data.revenueDistribution}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} empresas`}
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