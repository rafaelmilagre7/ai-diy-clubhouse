
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAchievements } from "@/hooks/achievements/useAchievements";
import { AchievementsTabs } from "@/components/achievements/AchievementsTabs";
import { AchievementsHeader } from "@/components/achievements/AchievementsHeader";
import { AchievementGrid } from "@/components/achievements/AchievementGrid";
import { LoadingState } from "@/components/achievements/states/LoadingState";
import { ErrorState } from "@/components/achievements/states/ErrorState";
import { EmptyState } from "@/components/achievements/states/EmptyState";
import { AchievementsActions } from "@/components/achievements/AchievementsActions";
import { useToast } from "@/hooks/use-toast";

export const AchievementsPage = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { loading, error, achievements } = useAchievements();
  const [activeCategory, setActiveCategory] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredAchievements = activeCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === activeCategory);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
      setIsRefreshing(false);
    }, 1000);
    toast({
      title: "Atualizando conquistas",
      description: "Suas conquistas estão sendo atualizadas.",
    });
  };

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={handleRefresh} />;
    
    if (isMobile) {
      return (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredAchievements.length === 0 ? (
              <EmptyState />
            ) : (
              <AchievementGrid achievements={filteredAchievements} />
            )}
          </div>
        </div>
      );
    }

    return <AchievementGrid achievements={filteredAchievements} />;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <AchievementsHeader />
        <AchievementsActions
          isRefreshing={isRefreshing}
          loading={loading}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          achievements={achievements}
          onRefresh={handleRefresh}
          onCategoryChange={setActiveCategory}
        />
      </div>
      
      {!isMobile && !loading && !error && (
        <AchievementsTabs 
          achievements={achievements} 
          orientation="horizontal"
          onCategoryChange={setActiveCategory}
        />
      )}
      
      {renderContent()}
    </div>
  );
};
