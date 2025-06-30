
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Link } from "react-router-dom";

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
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {profile?.name?.split(" ")[0] || "Membro"}!</h1>
        <p className="text-muted-foreground mt-1">
          Você tem {activeSolutionsCount} {activeSolutionsCount === 1 ? 'solução' : 'soluções'} em andamento 
          e {completedSolutionsCount} {completedSolutionsCount === 1 ? 'solução completada' : 'soluções completadas'}
        </p>
      </div>
      {isAdmin && (
        <Link to="/admin/solutions">
          <Button variant="default" className="bg-viverblue hover:bg-viverblue/90">
            <Settings className="mr-2 h-4 w-4" />
            Painel Admin
          </Button>
        </Link>
      )}
    </div>
  );
};
