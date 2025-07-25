
import { EngagementChart } from "./EngagementChart";
import { CompletionRateChart } from "./CompletionRateChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardChartsProps {
  engagementData: { name: string; value: number }[];
  completionRateData: { name: string; completion: number }[];
  loading: boolean;
}

export const DashboardCharts = ({ engagementData, completionRateData, loading }: DashboardChartsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-[180px] mb-4 mt-2" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-[180px] mb-4 mt-2" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <EngagementChart data={engagementData} />
      <CompletionRateChart data={completionRateData} />
    </div>
  );
};
