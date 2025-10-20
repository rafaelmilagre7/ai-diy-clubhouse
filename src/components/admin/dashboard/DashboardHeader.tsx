
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardHeaderProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export const DashboardHeader = ({ timeRange, setTimeRange }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-1">
          Plataforma VIVER DE IA
        </p>
      </div>
      <Tabs value={timeRange} onValueChange={setTimeRange} className="w-tabs">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="7d">7 dias</TabsTrigger>
          <TabsTrigger value="30d">30 dias</TabsTrigger>
          <TabsTrigger value="90d">90 dias</TabsTrigger>
          <TabsTrigger value="all">Todo período</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
