
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingAnalyticsData } from '@/hooks/admin/useOnboardingAnalytics';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface SalesOpportunitiesSectionProps {
  data: OnboardingAnalyticsData;
}

export const SalesOpportunitiesSection: React.FC<SalesOpportunitiesSectionProps> = ({ data }) => {
  // Esta seção será expandida no futuro com dados reais
  // Por enquanto, apresentamos apenas algumas métricas simuladas
  
  const leadCategories = useMemo(() => [
    { name: "Alto potencial", value: Math.floor(data.stats.totalUsers * 0.15), description: "Empresas com mais de 50 funcionários e objetivos de implementação claros" },
    { name: "Médio potencial", value: Math.floor(data.stats.totalUsers * 0.35), description: "Empresas de médio porte com interesse em implementação" },
    { name: "Potencial em desenvolvimento", value: Math.floor(data.stats.totalUsers * 0.50), description: "Empresas em fase exploratória ou de pequeno porte" },
  ], [data.stats.totalUsers]);
  
  const prioritySectors = useMemo(() => {
    // Pega os setores mais representativos (top 3)
    return data.sectorDistribution.slice(0, 3).map(sector => ({
      sector: sector.name,
      count: sector.value,
      percentage: ((sector.value / data.stats.totalUsers) * 100).toFixed(1)
    }));
  }, [data.sectorDistribution, data.stats.totalUsers]);
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {leadCategories.map((category) => (
          <Card key={category.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {category.name}
                <Badge className="ml-2" variant={
                  category.name === "Alto potencial" ? "default" :
                  category.name === "Médio potencial" ? "secondary" : "outline"
                }>
                  {category.value}
                </Badge>
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(category.value / data.stats.totalUsers) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {((category.value / data.stats.totalUsers) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="bg-amber-50 border-amber-200">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700">Funcionalidade em desenvolvimento</AlertTitle>
        <AlertDescription className="text-amber-600">
          O sistema de scoring de leads e oportunidades comerciais está sendo aprimorado. 
          Em breve, você terá acesso a dados mais detalhados e recomendações personalizadas.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Setores Prioritários</CardTitle>
          <CardDescription>Setores com maior concentração de membros</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setor</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Percentual</TableHead>
                <TableHead>Prioridade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prioritySectors.map((sector, index) => (
                <TableRow key={sector.sector}>
                  <TableCell className="font-medium">{sector.sector}</TableCell>
                  <TableCell>{sector.count}</TableCell>
                  <TableCell>{sector.percentage}%</TableCell>
                  <TableCell>
                    <Badge variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"}>
                      {index === 0 ? "Alta" : index === 1 ? "Média" : "Normal"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
