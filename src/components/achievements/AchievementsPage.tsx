
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAchievementsData } from "@/hooks/useAchievementsData";
import { AchievementsTabs } from "@/components/achievements/AchievementsTabs";
import { AchievementsHeader } from "@/components/achievements/AchievementsHeader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCw, AlertTriangle } from "lucide-react";
import { AchievementGrid } from "@/components/achievements/AchievementGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export const AchievementsPage = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { loading, error, achievements } = useAchievementsData();
  const [activeCategory, setActiveCategory] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredAchievements = activeCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === activeCategory);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simply wait a moment and refresh the page - in a real app you'd call a refresh function
    setTimeout(() => {
      window.location.reload();
      setIsRefreshing(false);
    }, 1000);
    toast({
      title: "Atualizando conquistas",
      description: "Suas conquistas estão sendo atualizadas.",
    });
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} onRetry={handleRefresh} />;
    }

    if (isMobile) {
      return (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredAchievements.length === 0 ? (
              <EmptyState />
            ) : (
              filteredAchievements.map((achievement) => (
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
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <AchievementGrid achievements={filteredAchievements} />
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <AchievementsHeader />
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
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
                      setActiveCategory(category);
                      setFilterOpen(false);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
      
      {!isMobile && !loading && !error && (
        <AchievementsTabs 
          achievements={achievements} 
          orientation="horizontal"
          onCategoryChange={setActiveCategory}
        />
      )}
      
      {renderContent()}
    </div>
  );
};

// Loading state component
const LoadingState = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      {isMobile ? (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-4 rounded-lg border">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-20 w-20 rounded-full mb-4" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="rounded-lg border p-6">
              <div className="flex flex-col items-center">
                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Error state component
const ErrorState = ({ error, onRetry }: { error: string, onRetry: () => void }) => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Erro ao carregar conquistas</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>{error}</p>
        <Button onClick={onRetry} size="sm" variant="outline">
          Tentar novamente
        </Button>
      </AlertDescription>
    </Alert>
  );
};

// Empty state component when no achievements match the filter
const EmptyState = () => {
  return (
    <div className="text-center py-8 bg-white rounded-lg border border-dashed">
      <div className="flex flex-col items-center px-4">
        <Filter className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">Nenhuma conquista encontrada</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-md">
          Não encontramos conquistas com esse filtro. Tente selecionar outra categoria ou continue implementando soluções.
        </p>
      </div>
    </div>
  );
};
