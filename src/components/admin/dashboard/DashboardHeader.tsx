
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp } from "lucide-react";

interface DashboardHeaderProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export const DashboardHeader = ({ timeRange, setTimeRange }: DashboardHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* Header principal com gradiente */}
      <Card variant="gradient" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
        
        <div className="relative z-10 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="accent" size="sm">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              </div>
              
              <div className="space-y-1">
                <Text variant="heading" textColor="primary" className="text-3xl font-bold">
                  Dashboard Administrativo
                </Text>
                <Text variant="body" textColor="secondary">
                  Visão completa da performance e crescimento da plataforma VIVER DE IA Club
                </Text>
              </div>
            </div>
            
            {/* Seletor de período modernizado */}
            <Card variant="elevated" className="backdrop-blur-sm bg-surface-elevated/80">
              <div className="p-2">
                <Tabs value={timeRange} onValueChange={setTimeRange} className="w-[400px]">
                  <TabsList className="grid grid-cols-4 bg-surface-hover">
                    <TabsTrigger value="7d" className="text-xs font-medium">
                      7 dias
                    </TabsTrigger>
                    <TabsTrigger value="30d" className="text-xs font-medium">
                      30 dias
                    </TabsTrigger>
                    <TabsTrigger value="90d" className="text-xs font-medium">
                      90 dias
                    </TabsTrigger>
                    <TabsTrigger value="all" className="text-xs font-medium">
                      Tudo
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};
