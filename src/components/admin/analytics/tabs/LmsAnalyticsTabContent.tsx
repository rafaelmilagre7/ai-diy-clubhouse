
import React from 'react';
import { RealLmsAnalyticsTab } from '../lms/RealLmsAnalyticsTab';

interface LmsAnalyticsTabContentProps {
  timeRange: string;
}

export const LmsAnalyticsTabContent = ({ timeRange }: LmsAnalyticsTabContentProps) => {
  return <RealLmsAnalyticsTab timeRange={timeRange} />;
};
