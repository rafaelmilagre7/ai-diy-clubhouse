
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

export const AchievementsPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
      toast({
        title: "Conquistas atualizadas",
        description: "Suas conquistas foram atualizadas com sucesso",
      });
    } catch (err) {
      console.error("Erro ao atualizar conquistas:", err);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as conquistas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Efeito para registrar logs no carregamento
  useEffect(() => {
    console.log("AchievementsPage renderizada");
    console.log("Estado de carregamento:", isLoading);
    console.log("Conquistas carregadas:", achievements.length);
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
    return <ErrorState error={error.message || "Erro ao carregar conquistas"} onRetry={() => refetch()} />;
  }

  console.log("Conquistas carregadas:", achievements.length, achievements);

  // Exibir estado vazio se não houver conquistas
  if (!achievements || achievements.length === 0) {
    return (
      <div className="space-y-8">
        <AchievementsHeader />
        <EmptyState />
        <div className="flex justify-center mt-8">
          <button 
            className="px-4 py-2 bg-viverblue text-white rounded-md hover:bg-viverblue/90 flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                Tentar Novamente
              </>
            )}
          </button>
        </div>
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
          onCategoryChange={setActiveCategory}
          onRefresh={handleRefresh}
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
