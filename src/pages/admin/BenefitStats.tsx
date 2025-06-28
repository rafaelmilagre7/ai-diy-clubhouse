
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';

interface BenefitStat {
  id: string;
  name: string;
  benefit_title: string;
  benefit_clicks: number;
  category: string;
}

const BenefitStats = () => {
  // Mock data since benefit_clicks table doesn't exist
  const mockStats: BenefitStat[] = [
    {
      id: '1',
      name: 'ChatGPT Plus',
      benefit_title: 'Acesso Premium ChatGPT',
      benefit_clicks: 145,
      category: 'IA'
    },
    {
      id: '2',
      name: 'Notion Pro',
      benefit_title: 'Workspace Ilimitado',
      benefit_clicks: 89,
      category: 'Produtividade'
    }
  ];

  const totalClicks = mockStats.reduce((sum, stat) => sum + stat.benefit_clicks, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estatísticas de Benefícios</h1>
          <p className="text-muted-foreground">
            Acompanhe o uso dos benefícios pelos membros
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefícios Ativos</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Benefícios disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Utilização</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              Dos membros utilizaram benefícios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Usuário</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2</div>
            <p className="text-xs text-muted-foreground">
              Cliques por usuário ativo
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Benefícios Mais Utilizados</CardTitle>
          <CardDescription>
            Ranking dos benefícios por quantidade de cliques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStats.map((stat, index) => (
              <div key={stat.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{stat.name}</h4>
                    <p className="text-sm text-muted-foreground">{stat.benefit_title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{stat.benefit_clicks}</div>
                  <div className="text-sm text-muted-foreground">cliques</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BenefitStats;
