
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardHeaderProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export const DashboardHeader = ({ timeRange, setTimeRange }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="text-left">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral da plataforma VIVER DE IA Club
        </p>
      </div>
      <Tabs value={timeRange} onValueChange={setTimeRange} className="w-[400px]">
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
