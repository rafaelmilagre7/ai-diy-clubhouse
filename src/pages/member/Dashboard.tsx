
import React from "react";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Bem-vindo à sua central de controle VIVER DE IA
        </p>
      </div>

      <OverviewCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivity />
        <QuickActions />
      </div>

      <UpcomingEvents />
    </div>
  );
};

export default Dashboard;
