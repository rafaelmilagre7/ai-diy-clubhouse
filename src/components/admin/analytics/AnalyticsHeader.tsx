
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
    </div>
  );
};
