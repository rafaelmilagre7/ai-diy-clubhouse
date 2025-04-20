import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    activeSolutions, 
    completedSolutions, 
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
      loading={loading}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      completedCount={completedCount}
      inProgressCount={inProgressCount}
      progressPercentage={progressPercentage}
      totalSolutions={totalSolutions}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
    >
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredSolutions.map((solution) => (
          <div
            key={solution.id}
            onClick={() => handleSelectSolution(solution.id)}
            className="cursor-pointer"
          >
            <div className="rounded-md border bg-card text-card-foreground shadow-sm w-full">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  {solution.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {solution.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
