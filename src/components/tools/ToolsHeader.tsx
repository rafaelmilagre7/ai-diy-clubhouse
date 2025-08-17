
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
    <div className="space-y-8">
      {/* Header com estilo similar ao dashboard */}
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-display gradient-text"
        >
          Ferramentas de IA
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-body-large text-text-secondary max-w-2xl mx-auto"
        >
          Descubra e acesse as melhores ferramentas de Inteligência Artificial para impulsionar seu negócio
        </motion.p>
      </div>

      {/* Barra de pesquisa centralizada */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
          <Input
            type="search"
            placeholder="Buscar ferramenta..."
            className="w-full pl-10 pr-4 py-3 surface-elevated border-border/50 focus:border-aurora/50 transition-all duration-200"
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
          className="flex items-center justify-center"
        >
          <span className="text-body-small text-text-muted mr-3">Filtro ativo:</span>
          <Badge 
            variant="outline" 
            className="flex items-center gap-2 px-3 py-1 border-aurora/30 bg-aurora/10 text-aurora"
          >
            {selectedCategory}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 hover:bg-transparent text-aurora hover:text-aurora-dark"
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
