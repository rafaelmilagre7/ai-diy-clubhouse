
import React from 'react';

interface AnalyticsHeaderProps {
  timeRange: string;
  setTimeRange: (value: string) => void;
}

export const AnalyticsHeader = ({ timeRange, setTimeRange }: AnalyticsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Análises</h1>
        <p className="text-muted-foreground">
          Visualize métricas e análises detalhadas da plataforma.
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm">Período:</span>
        <select 
          className="text-sm border rounded-md px-2 py-1"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
          <option value="all">Todo o período</option>
        </select>
      </div>
    </div>
  );
};
