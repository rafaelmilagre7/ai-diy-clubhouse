
import React from 'react';
import { SmartInsights } from './SmartInsights';
import { TrendAnalysis } from './TrendAnalysis';
import { PerformanceScore } from './PerformanceScore';
import { AutomatedAlerts } from './AutomatedAlerts';
import { UserJourneyAnalysis } from './UserJourneyAnalysis';

interface InsightsTabContentProps {
  timeRange: string;
}

export const InsightsTabContent: React.FC<InsightsTabContentProps> = ({ timeRange }) => {
  return (
    <div className="space-y-8">
      {/* Primeira linha - Insights principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SmartInsights timeRange={timeRange} />
        <AutomatedAlerts timeRange={timeRange} />
      </div>

      {/* Segunda linha - Análises avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendAnalysis timeRange={timeRange} />
        <PerformanceScore timeRange={timeRange} />
      </div>

      {/* Terceira linha - Jornada do usuário */}
      <UserJourneyAnalysis timeRange={timeRange} />
    </div>
  );
};
