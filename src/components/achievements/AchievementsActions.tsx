
import { Achievement } from "@/types/achievementTypes";

interface AchievementsActionsProps {
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  achievements: Achievement[];
  onCategoryChange?: (category: string) => void;
}

export const AchievementsActions = ({ 
  filterOpen, 
  setFilterOpen, 
  achievements,
  onCategoryChange 
}: AchievementsActionsProps) => {
  return (
    <div className="flex items-center gap-4">
      {/* Futuramente, podemos adicionar filtros ou outras ações aqui */}
    </div>
  );
};
