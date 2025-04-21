
import { useState } from "react";
import { Achievement } from "@/types/achievementTypes";
import { AchievementsTabs } from "./AchievementsTabs";

interface AchievementsTabsContainerProps {
  achievements: Achievement[];
}

export const AchievementsTabsContainer = ({ achievements }: AchievementsTabsContainerProps) => {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <AchievementsTabs
      achievements={achievements}
      onCategoryChange={setActiveCategory}
    />
  );
};
