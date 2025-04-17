
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, RefreshCw } from "lucide-react";
import { AchievementsTabs } from "@/components/achievements/AchievementsTabs";
import { Achievement } from "@/types/achievementTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface AchievementsActionsProps {
  isRefreshing: boolean;
  loading: boolean;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  achievements: Achievement[];
  onRefresh: () => void;
  onCategoryChange: (category: string) => void;
}

export const AchievementsActions = ({
  isRefreshing,
  loading,
  filterOpen,
  setFilterOpen,
  achievements,
  onRefresh,
  onCategoryChange,
}: AchievementsActionsProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing || loading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing && "animate-spin"}`} />
        {isRefreshing ? "Atualizando..." : "Atualizar"}
      </Button>
      
      {isMobile && (
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <div className="pt-6">
              <AchievementsTabs 
                achievements={achievements} 
                orientation="vertical"
                onCategoryChange={(category) => {
                  onCategoryChange(category);
                  setFilterOpen(false);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};
