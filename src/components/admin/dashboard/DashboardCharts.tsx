
import { EngagementChart } from "./EngagementChart";
import { CompletionRateChart } from "./CompletionRateChart";

interface DashboardChartsProps {
  engagementData: { name: string; value: number }[];
  completionRateData: { name: string; completion: number }[];
}

export const DashboardCharts = ({ engagementData, completionRateData }: DashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <EngagementChart data={engagementData} />
      <CompletionRateChart data={completionRateData} />
    </div>
  );
};
