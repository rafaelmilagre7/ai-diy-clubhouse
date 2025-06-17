import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Users, Eye, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
interface JourneyStep {
  id: string;
  name: string;
  description: string;
  users: number;
  conversionRate: number;
  avgTimeSpent: string;
  dropoffRate: number;
  status: 'healthy' | 'attention' | 'critical';
}
interface UserJourneyAnalysisProps {
  timeRange: string;
}
export const UserJourneyAnalysis: React.FC<UserJourneyAnalysisProps> = ({
  timeRange
}) => {
  const journeySteps: JourneyStep[] = [{
    id: '1',
    name: 'Cadastro',
    description: 'Usuário completa o registro na plataforma',
    users: 1250,
    conversionRate: 100,
    avgTimeSpent: '3min 45s',
    dropoffRate: 0,
    status: 'healthy'
  }, {
    id: '2',
    name: 'Primeiro Login',
    description: 'Usuário faz login pela primeira vez',
    users: 1180,
    conversionRate: 94.4,
    avgTimeSpent: '2min 15s',
    dropoffRate: 5.6,
    status: 'healthy'
  }, {
    id: '3',
    name: 'Exploração de Soluções',
    description: 'Usuário navega pelas soluções disponíveis',
    users: 1050,
    conversionRate: 89.0,
    avgTimeSpent: '12min 30s',
    dropoffRate: 11.0,
    status: 'healthy'
  }, {
    id: '4',
    name: 'Primeira Implementação',
    description: 'Usuário inicia sua primeira implementação',
    users: 875,
    conversionRate: 83.3,
    avgTimeSpent: '25min 12s',
    dropoffRate: 16.7,
    status: 'attention'
  }, {
    id: '5',
    name: 'Conclusão da Implementação',
    description: 'Usuário completa uma implementação',
    users: 620,
    conversionRate: 70.9,
    avgTimeSpent: '45min 20s',
    dropoffRate: 29.1,
    status: 'critical'
  }, {
    id: '6',
    name: 'Usuário Ativo Recorrente',
    description: 'Usuário retorna e implementa mais soluções',
    users: 480,
    conversionRate: 77.4,
    avgTimeSpent: '35min 08s',
    dropoffRate: 22.6,
    status: 'attention'
  }];
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Users className="h-5 w-5" />;
      case 1:
        return <Eye className="h-5 w-5" />;
      case 2:
        return <Play className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };
  const getStatusColor = (status: JourneyStep['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'attention':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };
  const getStatusIcon = (status: JourneyStep['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'attention':
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
  };
  return <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-purple-500" />
          Jornada do Usuário
        </CardTitle>
        <p className="text-sm text-gray-600">
          Análise do fluxo de usuários e pontos de abandono
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo Geral */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">1,250</div>
            <div className="text-sm text-gray-600">Usuários Iniciais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">29.1%</div>
            <div className="text-sm text-gray-600">Maior Abandono</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">480</div>
            <div className="text-sm text-gray-600">Usuários Ativos</div>
          </div>
        </div>

        {/* Fluxo da Jornada */}
        <div className="space-y-4">
          {journeySteps.map((step, index) => <React.Fragment key={step.id}>
              <div className="relative p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full", getStatusColor(step.status))}>
                      {getStepIcon(index)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-50">{step.name}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(step.status)}
                    <Badge className={cn("text-xs", getStatusColor(step.status))}>
                      {step.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Usuários:</span>
                    <div className="font-semibold text-gray-900">{step.users.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Taxa de Conversão:</span>
                    <div className="font-semibold text-gray-900">{step.conversionRate}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Tempo Médio:</span>
                    <div className="font-semibold text-gray-900">{step.avgTimeSpent}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Taxa de Abandono:</span>
                    <div className={cn("font-semibold", step.dropoffRate > 20 ? "text-red-600" : step.dropoffRate > 10 ? "text-orange-600" : "text-green-600")}>
                      {step.dropoffRate}%
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mt-3">
                  <Progress value={step.conversionRate} className="h-2" indicatorClassName={cn(step.status === 'healthy' && "bg-green-500", step.status === 'attention' && "bg-orange-500", step.status === 'critical' && "bg-red-500")} />
                </div>
              </div>

              {/* Seta entre os passos */}
              {index < journeySteps.length - 1 && <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>}
            </React.Fragment>)}
        </div>

        {/* Insights de Melhoria */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Oportunidades de Melhoria</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Maior abandono ocorre na conclusão de implementações (29.1%)</li>
            <li>• Considerar adicionar mais suporte durante implementações</li>
            <li>• Usuários que completam uma implementação têm alta chance de retorno (77.4%)</li>
          </ul>
        </div>
      </CardContent>
    </Card>;
};