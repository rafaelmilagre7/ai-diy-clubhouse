
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
import { OverviewTabContent } from '@/components/admin/analytics/OverviewTabContent';
import { AnalyticsHeader } from '@/components/admin/analytics/AnalyticsHeader';
import { PlaceholderTabContent } from '@/components/admin/analytics/PlaceholderTabContent';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  
  const filters = {
    timeRange,
    category,
    difficulty
  };
  
  const { data, loading } = useAnalyticsData(filters);

  return (
    <div className="space-y-6">
      <AnalyticsHeader 
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="365d">Último ano</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-auto">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="revenue">Aumento de Receita</SelectItem>
              <SelectItem value="operational">Otimização Operacional</SelectItem>
              <SelectItem value="strategy">Gestão Estratégica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-auto">
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as dificuldades</SelectItem>
              <SelectItem value="easy">Fácil</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="hard">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="solutions">Soluções</TabsTrigger>
          <TabsTrigger value="implementations">Implementações</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <OverviewTabContent timeRange={timeRange} loading={loading} data={data} />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <PlaceholderTabContent 
            title="Análise de Usuários" 
            description="Estatísticas e métricas detalhadas sobre os usuários da plataforma."
          />
        </TabsContent>
        
        <TabsContent value="solutions" className="space-y-4">
          <PlaceholderTabContent 
            title="Análise de Soluções" 
            description="Métricas de implementação e engajamento das soluções disponíveis."
          />
        </TabsContent>
        
        <TabsContent value="implementations" className="space-y-4">
          <PlaceholderTabContent 
            title="Análise de Implementações" 
            description="Estatísticas de progresso e conclusão das implementações."
          />
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-4">
          <PlaceholderTabContent 
            title="Análise de Engajamento" 
            description="Métricas de interação e atividade dos usuários na plataforma."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
