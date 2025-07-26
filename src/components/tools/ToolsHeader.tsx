
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CategoryGrid } from './CategoryGrid';
import { motion } from 'framer-motion';

interface ToolsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export const ToolsHeader = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: ToolsHeaderProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ferramentas</h1>
          <p className="text-muted-foreground mt-1">
            Explore todas as ferramentas recomendadas pelo VIVER DE IA Club
          </p>
        </div>
        <div className="relative lg:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ferramenta..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <CategoryGrid 
        selectedCategory={selectedCategory} 
        onCategoryChange={onCategoryChange} 
      />

      {selectedCategory && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center"
        >
          <span className="text-sm mr-2 text-muted-foreground">Filtro ativo:</span>
          <Badge 
            variant="outline" 
            className="flex items-center gap-1"
          >
            {selectedCategory}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onCategoryChange(null)}
            >
              ×
            </Button>
          </Badge>
        </motion.div>
      )}
    </div>
  );
};
