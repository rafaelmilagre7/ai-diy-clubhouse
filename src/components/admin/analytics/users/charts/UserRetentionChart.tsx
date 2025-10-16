import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

interface UserRetentionChartProps {
  data?: any;
  loading?: boolean;
}

export const UserRetentionChart = ({ data, loading }: UserRetentionChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise de Retenção
          </CardTitle>
          <CardDescription>Retenção de usuários por coorte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-200 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  // Mock data para retenção por coorte
  const retentionData = [
    { period: 'D0', retention: 100, label: 'Dia 0' },
    { period: 'D1', retention: 85, label: 'Dia 1' },
    { period: 'D3', retention: 72, label: 'Dia 3' },
    { period: 'D7', retention: 65, label: 'Dia 7' },
    { period: 'D14', retention: 58, label: 'Dia 14' },
    { period: 'D30', retention: 45, label: 'Dia 30' },
    { period: 'D60', retention: 38, label: 'Dia 60' },
    { period: 'D90', retention: 35, label: 'Dia 90' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-blue-600">
            Retenção: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Cálculos para insights
  const day1Retention = retentionData.find(d => d.period === 'D1')?.retention || 0;
  const day30Retention = retentionData.find(d => d.period === 'D30')?.retention || 0;
  const retentionHealth = day30Retention > 40 ? 'Boa' : day30Retention > 25 ? 'Regular' : 'Precisa Melhorar';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-revenue" />
          Análise de Retenção
        </CardTitle>
        <CardDescription>
          Taxa de retenção de usuários ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Gráfico de linha da retenção */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="retention" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas principais */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-operational">{day1Retention}%</div>
              <div className="text-sm text-muted-foreground">Retenção D1</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-revenue">{day30Retention}%</div>
              <div className="text-sm text-muted-foreground">Retenção D30</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                retentionHealth === 'Boa' ? 'text-success' :
                retentionHealth === 'Regular' ? 'text-warning' : 'text-destructive'
              }`}>
                {retentionHealth}
              </div>
              <div className="text-sm text-muted-foreground">Saúde Geral</div>
            </div>
          </div>

          {/* Benchmarks e insights */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium">Benchmarks da Indústria</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>📊 D1: 70-85% (Bom)</div>
              <div>📊 D7: 55-70% (Bom)</div>
              <div>📊 D30: 35-45% (Bom)</div>
              <div>📊 D90: 25-35% (Bom)</div>
            </div>
            
            <div className="mt-2 text-xs">
              <span className="font-medium">Status atual:</span>
              <span className={`ml-1 ${
                day30Retention > 40 ? 'text-success' : 
                day30Retention > 25 ? 'text-warning' : 'text-destructive'
              }`}>
                {day30Retention > 40 ? 'Acima da média' : 
                 day30Retention > 25 ? 'Na média' : 'Abaixo da média'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};