
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UsersHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const UsersHeader = ({
  searchQuery,
  onSearchChange,
}: UsersHeaderProps) => {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários da plataforma.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuário..."
            className="pl-8 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};
