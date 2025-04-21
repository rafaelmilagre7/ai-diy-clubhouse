
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
  const { achievements, loading, error, refetch } = useAchievements();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }

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
          loading={loading}
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
