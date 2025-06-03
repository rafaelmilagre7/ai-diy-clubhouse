
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Settings } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Link } from "react-router-dom";
import { useState } from "react";

interface DashboardHeaderProps {
  activeSolutionsCount: number;
  completedSolutionsCount: number;
  category: string;
  onCategoryChange: (category: string) => void;
}

export const DashboardHeader = ({
  activeSolutionsCount,
  completedSolutionsCount,
  category,
  onCategoryChange,
}: DashboardHeaderProps) => {
  const { isAdmin, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Aqui você poderia adicionar lógica para filtrar soluções por pesquisa
  };
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {profile?.name?.split(" ")[0] || "Membro"}!</h1>
        <p className="text-muted-foreground mt-1">
          Você tem {activeSolutionsCount} {activeSolutionsCount === 1 ? 'solução' : 'soluções'} em andamento 
          e {completedSolutionsCount} {completedSolutionsCount === 1 ? 'solução completada' : 'soluções completadas'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link to="/admin/solutions">
            <Button variant="default" className="bg-viverblue hover:bg-viverblue/90">
              <Settings className="mr-2 h-4 w-4" />
              Painel Admin
            </Button>
          </Link>
        )}
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar soluções..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
