
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
import { Achievement, achievementCache } from "@/types/achievementTypes";
import { useLocation, useNavigate } from "react-router-dom";

export const AchievementsPage = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [animateNewAchievements, setAnimateNewAchievements] = useState<string[]>([]);
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(true);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // React Query já fará o fetch automático ao montar o componente
  const { 
    data: achievements = [], 
    isLoading,
    isFetching,
    error,
    refetch 
  } = useAchievements();

  // Mostrar estado de carregamento por um tempo mínimo para evitar flashes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingTimeout(false);
    }, 1500); // Aumentamos o tempo mínimo de carregamento para 1.5s

    return () => clearTimeout(timer);
  }, []);

  // Efeito para registrar logs no carregamento
  useEffect(() => {
    console.log("AchievementsPage renderizada");
    console.log("Estado de carregamento:", isLoading);
    console.log("Está buscando dados:", isFetching);
    console.log("Conquistas carregadas:", Array.isArray(achievements) ? achievements.length : 0);
    if (error) {
      console.error("Erro no carregamento:", error);
    }
  }, [achievements, isLoading, isFetching, error]);
  
  // Efeito para detectar novas conquistas desbloqueadas
  useEffect(() => {
    if (!Array.isArray(achievements) || achievements.length === 0) return;
    
    const unlockedAchievements = achievements.filter(a => a.isUnlocked);
    
    // Armazena IDs das conquistas já vistas nesta sessão
    const seenAchievements = sessionStorage.getItem('seen_achievements');
    const seenIds = seenAchievements ? JSON.parse(seenAchievements) : [];
    
    // Encontra conquistas recentemente desbloqueadas
    const newlyUnlocked = unlockedAchievements
      .filter(a => a.isUnlocked && !seenIds.includes(a.id))
      .map(a => a.id);
    
    if (newlyUnlocked.length > 0) {
      console.log('Novas conquistas desbloqueadas:', newlyUnlocked);
      
      // Atualiza a lista de conquistas vistas
      const updatedSeenIds = [...seenIds, ...newlyUnlocked];
      sessionStorage.setItem('seen_achievements', JSON.stringify(updatedSeenIds));
      
      // Define quais conquistas devem ser animadas
      setAnimateNewAchievements(newlyUnlocked);
      
      // Mostra toast para cada nova conquista
      newlyUnlocked.forEach(id => {
        const achievement = achievements.find(a => a.id === id);
        if (achievement) {
          toast({
            title: `🏆 Nova conquista: ${achievement.name}`,
            description: achievement.description,
            variant: "default",
          });
        }
      });
    }
  }, [achievements, toast]);
  
  // Prefetch de dados ao navegar para esta página
  useEffect(() => {
    // Quando o usuário navega para esta página
    if (location.pathname === "/achievements") {
      console.log('Página de conquistas ativada, atualizando dados');
      // Verificar se o cache está expirado antes de refetch
      if (!achievementCache.isValid()) {
        refetch();
      }
    }
  }, [location.pathname, refetch]);

  // Estado para exibição durante o primeiro carregamento
  if ((isLoading && showLoadingTimeout) || (isLoading && (!achievements || achievements.length === 0))) {
    return <LoadingState />;
  }

  // Exibir estado de erro se algo falhar
  if (error && (!achievements || achievements.length === 0)) {
    return <ErrorState error={(error as Error).message || "Erro ao carregar conquistas"} onRetry={() => refetch()} />;
  }

  // Garantir que achievements seja um array antes de verificar length
  const achievementsArray = Array.isArray(achievements) ? achievements : [];
  
  // Exibir estado vazio se não houver conquistas
  // Forçar o usuário a ter pelo menos a conquista "Iniciante" se tiver algum progresso
  if (!achievements || achievementsArray.length === 0) {
    return (
      <div className="space-y-8">
        <AchievementsHeader />
        <EmptyState onExploreClick={() => navigate("/dashboard")} />
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
        animateIds={animateNewAchievements}
      />
      
      {/* Indicador de atualização em tempo real */}
      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse z-50">
          Atualizando conquistas...
        </div>
      )}
    </div>
  );
};
