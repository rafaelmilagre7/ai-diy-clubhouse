
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
  achievements,
  isRefreshing,
  onRefresh 
}: AchievementsActionsProps) => {
  return (
    <div className="flex items-center gap-4">
      {onRefresh && (
        <Button 
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <>
              <div className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
              <span>Atualizando...</span>
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4" />
              <span>Atualizar Conquistas</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
};
