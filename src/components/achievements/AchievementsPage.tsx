
import { useState, useEffect } from "react";
import { useAchievements } from "@/hooks/achievements/useAchievements";
import { AchievementsHeader } from "./AchievementsHeader";
import { AchievementsProgressCard } from "./AchievementsProgressCard";
import { AchievementsTabsContainer } from "./AchievementsTabsContainer";
import { LoadingState } from "./states/LoadingState";
import { EmptyState } from "./states/EmptyState";
import { ErrorState } from "./states/ErrorState";
import { AchievementsActions } from "./AchievementsActions";
import { useToast } from "@/hooks/use-toast";
import { Achievement } from "@/types/achievementTypes";

export const AchievementsPage = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const { toast } = useToast();
  
  // React Query já fará o fetch automático ao montar o componente
  const { 
    data: achievements = [], 
    isLoading,
    error,
    refetch 
  } = useAchievements();

  // Efeito para registrar logs no carregamento
  useEffect(() => {
    console.log("AchievementsPage renderizada");
    console.log("Estado de carregamento:", isLoading);
    console.log("Conquistas carregadas:", Array.isArray(achievements) ? achievements.length : 0);
    if (error) {
      console.error("Erro no carregamento:", error);
    }
  }, [achievements, isLoading, error]);

  // Exibir estado de carregamento inicial
  if (isLoading) {
    return <LoadingState />;
  }

  // Exibir estado de erro se algo falhar
  if (error) {
    return <ErrorState error={(error as Error).message || "Erro ao carregar conquistas"} onRetry={() => refetch()} />;
  }

  console.log("Conquistas carregadas:", Array.isArray(achievements) ? achievements.length : 0, achievements);

  // Garantir que achievements é um array antes de verificar length
  const achievementsArray = Array.isArray(achievements) ? achievements : [];

  // Exibir estado vazio se não houver conquistas
  if (!achievements || achievementsArray.length === 0) {
    return (
      <div className="space-y-8">
        <AchievementsHeader />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <AchievementsHeader />
        <AchievementsActions 
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          achievements={achievementsArray}
          onCategoryChange={setActiveCategory}
        />
      </div>
      <AchievementsProgressCard achievements={achievementsArray} />
      <AchievementsTabsContainer 
        achievements={achievementsArray} 
        onCategoryChange={setActiveCategory}
      />
    </div>
  );
};
