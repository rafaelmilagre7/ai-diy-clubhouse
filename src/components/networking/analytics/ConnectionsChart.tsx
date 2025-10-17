import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { NetworkingAnalytics } from '@/hooks/networking/useNetworkingAnalytics';

interface ConnectionsChartProps {
  analytics: NetworkingAnalytics;
}

export const ConnectionsChart: React.FC<ConnectionsChartProps> = ({ analytics }) => {
  return (
    <Card className="p-6 border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Crescimento de Conexões
          </h3>
          <p className="text-sm text-muted-foreground">
            Evolução dos últimos 6 meses
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={analytics.connectionsOverTime}>
          <defs>
            <linearGradient id="colorConnections" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-card-soft)'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            fill="url(#colorConnections)"
            name="Conexões"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
