
import { useState } from "react";
import { Achievement } from "@/types/achievementTypes";
import { AchievementsTabs } from "./AchievementsTabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface AchievementsTabsContainerProps {
  achievements: Achievement[];
  onCategoryChange?: (category: string) => void;
}

export const AchievementsTabsContainer = ({ 
  achievements, 
  onCategoryChange 
}: AchievementsTabsContainerProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const isMobile = useIsMobile();
  
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
      />
    </div>
  );
};
