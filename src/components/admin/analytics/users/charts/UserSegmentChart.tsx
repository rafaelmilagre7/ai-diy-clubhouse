import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';

interface UserSegment {
  name: string;
  count: number;
  percentage: number;
  description: string;
  healthScore: number;
  trend: number;
}

interface UserSegmentChartProps {
  data?: UserSegment[];
  loading?: boolean;
}

const SEGMENT_COLORS = {
  'Power Users': 'hsl(var(--success))',
  'Ativos': 'hsl(var(--info))', 
  'Dormentes': 'hsl(var(--warning))',
  'Em Risco': 'hsl(var(--destructive))',
  'Novos': 'hsl(var(--secondary))'
};

export const UserSegmentChart = ({ data, loading }: UserSegmentChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Segmentação de Usuários
          </CardTitle>
          <CardDescription>Distribuição por tipo de engajamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 animate-pulse rounded" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.map(segment => ({
    name: segment.name,
    value: segment.count,
    percentage: segment.percentage,
    color: SEGMENT_COLORS[segment.name as keyof typeof SEGMENT_COLORS] || '#6B7280'
  })) || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} usuários ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Segmentação de Usuários
        </CardTitle>
        <CardDescription>
          Distribuição dos usuários por nível de engajamento e atividade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gráfico de Pizza */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista detalhada de segmentos */}
          <div className="space-y-3">
            {data?.map((segment) => (
              <div 
                key={segment.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: SEGMENT_COLORS[segment.name as keyof typeof SEGMENT_COLORS] || '#6B7280'
                    }}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{segment.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {segment.count} usuários
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{segment.description}</p>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{segment.percentage}%</span>
                    {segment.trend >= 0 ? (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs">+{segment.trend}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <TrendingDown className="h-3 w-3" />
                        <span className="text-xs">{segment.trend}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Health Score:</span>
                    <div className="flex items-center space-x-1">
                      <Progress value={segment.healthScore} className="w-12 h-1" />
                      <span className="text-xs font-medium">{segment.healthScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Resumo dos insights */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">💡 Insights Principais</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {data && (
                <>
                  <p>
                    • <strong>{data.find(s => s.name === 'Power Users')?.percentage || 0}%</strong> dos usuários são altamente engajados
                  </p>
                  <p>
                    • <strong>{data.find(s => s.name === 'Em Risco')?.count || 0}</strong> usuários precisam de atenção imediata
                  </p>
                  <p>
                    • <strong>{data.find(s => s.name === 'Novos')?.count || 0}</strong> novos usuários no período selecionado
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};