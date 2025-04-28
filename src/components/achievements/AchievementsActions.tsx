
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Achievement } from "@/types/achievementTypes";

interface AchievementsActionsProps {
  isRefreshing: boolean;
  loading: boolean;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  achievements: Achievement[];
}

export const AchievementsActions = ({ 
  filterOpen, 
  setFilterOpen, 
  achievements 
}: AchievementsActionsProps) => {
  return (
    <div className="flex items-center gap-4">
      {/* Removi o botão de atualizar como solicitado */}
    </div>
  );
};
