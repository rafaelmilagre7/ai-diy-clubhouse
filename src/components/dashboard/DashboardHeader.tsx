
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface DashboardHeaderProps {
  profileName: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const DashboardHeader = ({
  profileName,
  searchQuery,
  onSearchChange,
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {profileName?.split(" ")[0] || "Membro"}!</h1>
        <p className="text-muted-foreground mt-1">
          Escolha uma solução de IA para implementar em sua empresa
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar soluções..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
