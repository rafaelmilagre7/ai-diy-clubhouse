
import React from 'react';
import { SmartInsights } from './SmartInsights';
import { PerformanceScore } from './PerformanceScore';
import { AutomatedAlerts } from './AutomatedAlerts';
import { UserJourneyAnalysis } from './UserJourneyAnalysis';
import { TrendAnalysis } from './TrendAnalysis';

interface InsightsTabContentProps {
  timeRange: string;
}

export const InsightsTabContent: React.FC<InsightsTabContentProps> = ({ timeRange }) => {
  return (
    <div className="space-y-8">
      {/* Primeira linha - Alertas e Performance Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AutomatedAlerts timeRange={timeRange} />
        <PerformanceScore timeRange={timeRange} />
      </div>

      {/* Segunda linha - Insights Inteligentes */}
      <SmartInsights timeRange={timeRange} />

      {/* Terceira linha - Análises Avançadas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UserJourneyAnalysis timeRange={timeRange} />
        <TrendAnalysis timeRange={timeRange} />
      </div>
    </div>
  );
};
