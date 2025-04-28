
import { useState, useEffect } from "react";
import { Achievement } from "@/types/achievementTypes";
import { AchievementsTabs } from "./AchievementsTabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface AchievementsTabsContainerProps {
  achievements: Achievement[];
  onCategoryChange?: (category: string) => void;
  animateIds?: string[];
}

export const AchievementsTabsContainer = ({ 
  achievements, 
  onCategoryChange,
  animateIds = []
}: AchievementsTabsContainerProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const isMobile = useIsMobile();
  
  // Efeito para passar animateIds para os componentes filhos que precisarem
  useEffect(() => {
    if (animateIds.length > 0) {
      console.log("Novas conquistas para animar:", animateIds);
    }
  }, [animateIds]);
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <AchievementsTabs
        achievements={achievements}
        onCategoryChange={handleCategoryChange}
        orientation={isMobile ? "horizontal" : "horizontal"}
        animateIds={animateIds}
      />
    </div>
  );
};
