
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useEffect } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CategoryTabs } from "@/components/dashboard/CategoryTabs";

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const { 
    filteredSolutions, 
    loading, 
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
