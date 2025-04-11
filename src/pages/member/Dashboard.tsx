
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useEffect } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CategoryTabs } from "@/components/dashboard/CategoryTabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const { 
    filteredSolutions, 
    loading, 
    error,
    searchQuery, 
    setSearchQuery, 
    activeCategory, 
    setActiveCategory 
  } = useSolutionsData(categoryParam);
  
  // Update active category when URL param changes
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam, setActiveCategory]);
  
  const handleSelectSolution = (id: string) => {
    navigate(`/solution/${id}`);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('supabase.auth.token');
    window.location.href = '/login';
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <DashboardHeader 
        profileName={profile?.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar soluções</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-3">
              <Button variant="outline" onClick={handleLogout}>
                Voltar para o login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Category tabs */}
      <CategoryTabs 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        filteredSolutions={filteredSolutions}
        onSelectSolution={handleSelectSolution}
      />
    </div>
  );
};

export default Dashboard;
