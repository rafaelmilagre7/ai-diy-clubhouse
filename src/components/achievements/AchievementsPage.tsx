
import { useState } from "react";
import { useAchievements } from "@/hooks/achievements/useAchievements";
import { AchievementsHeader } from "./AchievementsHeader";
import { AchievementsProgressCard } from "./AchievementsProgressCard";
import { AchievementsTabsContainer } from "./AchievementsTabsContainer";
import { LoadingState } from "./states/LoadingState";
import { EmptyState } from "./states/EmptyState";
import { ErrorState } from "./states/ErrorState";
import { AchievementsActions } from "./AchievementsActions";

export const AchievementsPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  
  // React Query já fará o fetch automático ao montar o componente
  const { 
    data: achievements = [], 
    isLoading,
    error,
    refetch 
  } = useAchievements();

  // Handler para atualização manual via botão
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Exibir estado de carregamento inicial
  if (isLoading) {
    return <LoadingState />;
  }

  // Exibir estado de erro se algo falhar
  if (error) {
    return <ErrorState error={error.message || "Erro ao carregar conquistas"} onRetry={handleRefresh} />;
  }

  console.log("Conquistas carregadas:", achievements.length, achievements);

  // Exibir estado vazio se não houver conquistas
  if (!achievements || achievements.length === 0) {
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
          isRefreshing={isRefreshing}
          loading={isLoading}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          achievements={achievements}
          onRefresh={handleRefresh}
          onCategoryChange={setActiveCategory}
        />
      </div>
      <AchievementsProgressCard achievements={achievements} />
      <AchievementsTabsContainer 
        achievements={achievements} 
        onCategoryChange={setActiveCategory}
      />
    </div>
  );
};
