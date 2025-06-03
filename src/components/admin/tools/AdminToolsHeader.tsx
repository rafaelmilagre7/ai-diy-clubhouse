
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminToolsHeaderProps {
  onRefreshRequest?: () => void;
}

export const AdminToolsHeader = ({ onRefreshRequest }: AdminToolsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">Ferramentas</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie ferramentas e benefícios para membros
        </p>
      </div>
      <Button asChild className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90">
        <Link to="/admin/tools/new">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Ferramenta
        </Link>
      </Button>
    </div>
  );
};
