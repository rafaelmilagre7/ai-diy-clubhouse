import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';
import { NetworkingAnalytics } from '@/hooks/networking/useNetworkingAnalytics';

interface InteractionsChartProps {
  analytics: NetworkingAnalytics;
}

export const InteractionsChart: React.FC<InteractionsChartProps> = ({ analytics }) => {
  return (
    <Card className="p-6 border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Interações por Tipo
          </h3>
          <p className="text-sm text-muted-foreground">
            Distribuição de atividades realizadas
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analytics.interactionsByType}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="type" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
          />
          <Bar 
            dataKey="count" 
            fill="hsl(var(--primary))"
            radius={[8, 8, 0, 0]}
            name="Quantidade"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
