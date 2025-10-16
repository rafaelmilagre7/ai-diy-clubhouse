import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, Users } from 'lucide-react';

interface FunnelStep {
  name: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

interface UserFunnelChartProps {
  data?: FunnelStep[];
  loading?: boolean;
}

export const UserFunnelChart = ({ data, loading }: UserFunnelChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Funil de Conversão
          </CardTitle>
          <CardDescription>Jornada do usuário na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxUsers = data?.[0]?.users || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-operational" />
          Funil de Conversão
        </CardTitle>
        <CardDescription>
          Jornada do usuário desde o cadastro até engajamento completo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.map((step, index) => {
            const widthPercentage = (step.users / maxUsers) * 100;
            const isLastStep = index === data.length - 1;
            
            return (
              <div key={step.name} className="relative">
                {/* Funnel Step */}
                <div 
                  className={`
                    relative p-4 rounded-lg transition-all duration-300 hover:shadow-md
                    ${index === 0 ? 'bg-operational/10 border-operational/30' :
                      index === 1 ? 'bg-info/10 border-info/30' :
                      index === 2 ? 'bg-strategy/10 border-strategy/30' :
                      index === 3 ? 'bg-accent/10 border-accent/30' :
                      'bg-success/10 border-success/30'}
                    border-2
                  `}
                  style={{ 
                    width: `${Math.max(widthPercentage, 20)}%`,
                    marginLeft: index > 0 ? `${(100 - widthPercentage) / 2}%` : '0'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{step.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {step.users.toLocaleString()} usuários
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-success">
                        {step.conversionRate}%
                      </span>
                      {step.dropoffRate > 0 && (
                        <div className="flex items-center text-destructive">
                          <TrendingDown className="h-3 w-3" />
                          <span className="text-xs ml-1">{step.dropoffRate}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress bar visual */}
                  <div className="mt-2">
                    <Progress 
                      value={step.conversionRate} 
                      className="h-1"
                    />
                  </div>
                </div>
                
                {/* Connection line to next step */}
                {!isLastStep && (
                  <div className="flex justify-center my-2">
                    <div className="w-px h-4 bg-gray-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        {data && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-operational">
                  {data[0]?.users.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Cadastros</div>
              </div>
              <div>
                <div className="text-lg font-bold text-success">
                  {data[data.length - 1]?.users.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Usuários Ativos</div>
              </div>
              <div>
                <div className="text-lg font-bold text-strategy">
                  {data[data.length - 1]?.conversionRate}%
                </div>
                <div className="text-xs text-muted-foreground">Taxa Conversão Final</div>
              </div>
              <div>
                <div className="text-lg font-bold text-revenue">
                  {Math.round(data.reduce((sum, step) => sum + step.dropoffRate, 0) / data.length)}%
                </div>
                <div className="text-xs text-muted-foreground">Abandono Médio</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};