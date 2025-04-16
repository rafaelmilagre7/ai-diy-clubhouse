
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/common/LoadingScreen";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { StatsOverview } from "@/components/admin/dashboard/StatsOverview";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";

// Mock data for now - will connect to Supabase later
const overviewData = {
  totalUsers: 264,
  totalSolutions: 18,
  completedImplementations: 735,
  averageTime: 28, // in minutes
  userGrowth: 12.5, // percentage
  implementationRate: 72.3, // percentage
};

const engagementData = [
  { name: "Seg", value: 34 },
  { name: "Ter", value: 42 },
  { name: "Qua", value: 67 },
  { name: "Qui", value: 53 },
  { name: "Sex", value: 49 },
  { name: "Sab", value: 22 },
  { name: "Dom", value: 19 },
];

const completionRateData = [
  { name: "Landing", completion: 100 },
  { name: "Visão Geral", completion: 92 },
  { name: "Preparação", completion: 87 },
  { name: "Implementação", completion: 76 },
  { name: "Verificação", completion: 68 },
  { name: "Resultados", completion: 61 },
  { name: "Otimização", completion: 54 },
  { name: "Celebração", completion: 52 },
];

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader timeRange={timeRange} setTimeRange={setTimeRange} />
      
      {/* Overview stats */}
      <StatsOverview data={overviewData} />
      
      {/* Charts */}
      <DashboardCharts 
        engagementData={engagementData} 
        completionRateData={completionRateData} 
      />
      
      {/* Recent activity */}
      <RecentActivity />
    </div>
  );
};

export default AdminDashboard;
