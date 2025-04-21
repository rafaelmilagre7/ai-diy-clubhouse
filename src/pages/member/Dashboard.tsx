
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SolutionsGrid } from "@/components/dashboard/SolutionsGrid";
import { CategoryTabs } from "@/components/dashboard/CategoryTabs";
import { Card } from "@/components/ui/card";
import { ProgressSummary } from "@/components/dashboard/ProgressSummary";
import { Solution } from "@/hooks/dashboard/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    activeSolutions, 
    completedSolutions, 
    recommendedSolutions,
    loading, 
    allSolutions 
  } = useDashboardProgress();
  
  const { 
    filteredSolutions, 
    activeCategory, 
    setActiveCategory 
  } = useSolutionsData(categoryParam);
  
  const completedCount = completedSolutions.length;
  const inProgressCount = activeSolutions.length;
  const totalSolutions = filteredSolutions.length;
  const progressPercentage = totalSolutions > 0 
    ? Math.round((completedCount / totalSolutions) * 100) 
    : 0;
  
  const handleSelectSolution = (id: string) => {
    console.log("Navegando para detalhes da solução:", id);
    toast.success("Carregando solução...");
    navigate(`/solution/${id}`);
  };

  return (
    <DashboardLayout
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="space-y-6">
        <Card className="p-6">
          <ProgressSummary 
            totalSolutions={totalSolutions}
            completedCount={completedCount}
            inProgressCount={inProgressCount}
            progressPercentage={progressPercentage}
          />
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Soluções em Andamento</h2>
          {activeSolutions.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">Você não possui soluções em andamento.</p>
              <p className="text-sm text-gray-400 mt-2">
                Selecione uma solução da sua trilha personalizada para começar.
              </p>
            </Card>
          ) : (
            <SolutionsGrid 
              solutions={activeSolutions} 
              onSolutionClick={handleSelectSolution}
              category="inProgress"
            />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recomendações para Você</h2>
          {recommendedSolutions.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">Nenhuma solução recomendada disponível.</p>
            </Card>
          ) : (
            <SolutionsGrid 
              solutions={recommendedSolutions} 
              onSolutionClick={handleSelectSolution}
              category="recommended"
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Todas as Soluções</h2>
            <CategoryTabs 
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </div>
          
          <SolutionsGrid 
            solutions={filteredSolutions} 
            onSolutionClick={handleSelectSolution}
            category="all"
            loading={loading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
