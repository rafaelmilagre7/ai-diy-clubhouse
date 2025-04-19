
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

interface AdminToolsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const AdminToolsHeader = ({
  searchQuery,
  onSearchChange,
}: AdminToolsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Ferramentas</h1>
        <p className="text-muted-foreground mt-1">
          Adicione, edite e remova ferramentas do glossário
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ferramenta..."
            className="w-full pl-8 sm:w-64"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Link to="/admin/tools/new">
          <Button className="w-full sm:w-auto bg-[#0ABAB5] hover:bg-[#0ABAB5]/90">
            <Plus className="mr-2 h-4 w-4" />
            Nova ferramenta
          </Button>
        </Link>
      </div>
    </div>
  );
};
