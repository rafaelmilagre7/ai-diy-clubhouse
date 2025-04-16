
import { useIsMobile } from "@/hooks/use-mobile";
import { useAchievementsData } from "@/hooks/useAchievementsData";
import LoadingScreen from "@/components/common/LoadingScreen";
import { AchievementsTabs } from "@/components/achievements/AchievementsTabs";
import { AchievementsHeader } from "@/components/achievements/AchievementsHeader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useState } from "react";

export const AchievementsPage = () => {
  const isMobile = useIsMobile();
  const { loading, achievements } = useAchievementsData();
  const [activeCategory, setActiveCategory] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  if (loading) {
    return <LoadingScreen message="Carregando suas conquistas..." />;
  }

  const filteredAchievements = activeCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === activeCategory);

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <AchievementsHeader />
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
                    setActiveCategory(category);
                    setFilterOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredAchievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border ${
                  achievement.isUnlocked 
                    ? achievement.category === "revenue" 
                      ? "border-revenue/30" 
                      : achievement.category === "operational" 
                        ? "border-operational/30" 
                        : achievement.category === "strategy" 
                          ? "border-strategy/30" 
                          : "border-viverblue/30"
                    : "border-gray-200"
                }`}
              >
                <AchievementGrid achievements={[achievement]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AchievementsHeader />
      <AchievementsTabs 
        achievements={achievements} 
        orientation="horizontal"
        onCategoryChange={setActiveCategory}
      />
    </div>
  );
};

// Import AchievementGrid here to avoid circular dependency
import { AchievementGrid } from "@/components/achievements/AchievementGrid";
