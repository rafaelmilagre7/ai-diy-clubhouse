
import React from "react";
import { useAuth } from "@/contexts/auth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ImplementationTrail } from "@/components/dashboard/ImplementationTrail";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { OnboardingStatusChecker } from "@/components/dashboard/OnboardingStatusChecker";
import { PageTransition } from "@/components/transitions/PageTransition";

const Dashboard = () => {
  const { profile } = useAuth();

  return (
    <PageTransition>
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Olá, {profile?.name || 'Membro'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel de controle do VIVER DE IA Club.
          </p>
        </div>

        {/* Status do Onboarding */}
        <OnboardingStatusChecker />

        {/* Estatísticas */}
        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trilha de Implementação */}
          <div>
            <ImplementationTrail />
          </div>

          {/* Atividade Recente */}
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
