
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Achievement } from "@/types/achievementTypes";

interface AchievementsActionsProps {
  isRefreshing: boolean;
  loading: boolean;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  achievements: Achievement[];
  onRefresh?: () => Promise<void>;
  onCategoryChange?: (category: string) => void;
}

export const AchievementsActions = ({ 
  filterOpen, 
  setFilterOpen, 
  achievements 
}: AchievementsActionsProps) => {
  return (
    <div className="flex items-center gap-4">
      {/* Botão de atualizar removido conforme solicitado */}
    </div>
  );
};
