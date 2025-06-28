import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Target, Zap } from 'lucide-react';

interface InsightsTabContentProps {
  timeRange: string;
}

export const InsightsTabContent: React.FC<InsightsTabContentProps> = ({ timeRange }) => {
  const insights = [
    {
      icon: TrendingUp,
      title: "Crescimento Acelerado",
      description: "Aumento de 32% no engajamento dos usuários",
      trend: "+32%",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Retenção Melhorada",
      description: "Taxa de retenção de usuários aumentou para 78%",
      trend: "+15%",
      color: "text-blue-500"
    },
    {
      icon: Target,
      title: "Conversão Otimizada",
      description: "Meta de implementação atingida em 85% dos casos",
      trend: "+8%",
      color: "text-purple-500"
    },
    {
      icon: Zap,
      title: "Performance Melhorada",
      description: "Tempo de carregamento reduzido em 40%",
      trend: "-40%",
      color: "text-orange-500"
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Insights Inteligentes</h2>
        <p className="text-gray-400 mb-6">
          Análises automatizadas para o período: {timeRange}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <insight.icon className={`h-5 w-5 ${insight.color}`} />
                <CardTitle className="text-white text-sm font-medium">
                  {insight.title}
                </CardTitle>
              </div>
              <div className="ml-auto">
                <span className={`text-sm font-bold ${insight.color}`}>
                  {insight.trend}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                {insight.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Recomendações Automatizadas</CardTitle>
          <CardDescription className="text-gray-400">
            Baseado na análise dos dados do período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Foque em Soluções de Receita</p>
                <p className="text-gray-400 text-sm">Maior taxa de conversão e engajamento</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Otimize Conteúdo para Mobile</p>
                <p className="text-gray-400 text-sm">60% dos acessos são via dispositivos móveis</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Implemente Gamificação</p>
                <p className="text-gray-400 text-sm">Pode aumentar o engajamento em até 25%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
