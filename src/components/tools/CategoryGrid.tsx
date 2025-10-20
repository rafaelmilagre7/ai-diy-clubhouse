
import { useState, useEffect } from 'react';
import { useTools } from '@/hooks/useTools';
import { Badge } from '@/components/ui/badge';
import { ToolCategory } from '@/types/toolTypes';
import { 
  Palette, 
  MessageSquare, 
  Code, 
  TrendingUp, 
  Shield, 
  FileText, 
  Globe, 
  Music, 
  Video, 
  Image, 
  Database,
  Layers,
  Headphones,
  Settings,
  Search,
  Book,
  Calendar,
  Monitor,
  LayoutGrid,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  category: string | null;
  label: string;
  icon: React.ReactNode;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}

interface CategoryGridProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CategoryCard = ({ category, label, icon, count, isSelected, onClick }: CategoryCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200 interactive-press",
        isSelected 
          ? "surface-overlay border-2 border-aurora text-aurora shadow-aurora/20" 
          : "surface-elevated border border-border/50 hover:border-aurora/50 hover:bg-aurora/5"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "w-10 h-10 flex items-center justify-center rounded-md mb-2 transition-colors duration-200",
        isSelected ? "bg-aurora/20" : "bg-surface-base"
      )}>
        {icon}
      </div>
      <p className="text-body-small text-center line-clamp-2 h-10 flex items-center">
        {label}
      </p>
      <Badge 
        variant="outline" 
        className={cn(
          "mt-1 text-xs transition-all duration-200",
          isSelected 
            ? "bg-aurora/10 border-aurora/50 text-aurora" 
            : "bg-surface-base border-border/30 text-text-muted"
        )}
      >
        {count}
      </Badge>
    </motion.div>
  );
};

export const CategoryGrid = ({ selectedCategory, onCategoryChange }: CategoryGridProps) => {
  const { tools, isLoading } = useTools();
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Calcula o número de ferramentas por categoria
  useEffect(() => {
    if (!isLoading && tools) {
      const counts: Record<string, number> = { all: tools.length };
      
      tools.forEach(tool => {
        if (tool.status) { // Apenas ferramentas ativas
          if (counts[tool.category]) {
            counts[tool.category]++;
          } else {
            counts[tool.category] = 1;
          }
        }
      });
      
      setCategoryCounts(counts);
    }
  }, [tools, isLoading]);

  // Define ícones para cada categoria
  const getCategoryIcon = (category: string | null) => {
    const iconSize = 20;
    const iconClassName = selectedCategory === category ? "text-aurora" : "text-muted-foreground";
    
    switch(category) {
      case 'Modelos de IA e Interfaces':
        return <Layers size={iconSize} className={iconClassName} />;
      case 'Geração de Conteúdo Visual':
        return <Image size={iconSize} className={iconClassName} />;
      case 'Geração e Processamento de Áudio':
        return <Headphones size={iconSize} className={iconClassName} />;
      case 'Automação e Integrações':
        return <Settings size={iconSize} className={iconClassName} />;
      case 'Comunicação e Atendimento':
        return <MessageSquare size={iconSize} className={iconClassName} />;
      case 'Captura e Análise de Dados':
        return <Database size={iconSize} className={iconClassName} />;
      case 'Pesquisa e Síntese de Informações':
        return <Search size={iconSize} className={iconClassName} />;
      case 'Gestão de Documentos e Conteúdo':
        return <Book size={iconSize} className={iconClassName} />;
      case 'Marketing e CRM':
        return <TrendingUp size={iconSize} className={iconClassName} />;
      case 'Produtividade e Organização':
        return <Calendar size={iconSize} className={iconClassName} />;
      case 'Desenvolvimento e Código':
        return <Code size={iconSize} className={iconClassName} />;
      case 'Plataformas de Mídia':
        return <Monitor size={iconSize} className={iconClassName} />;
      default: // 'Todas'
        return <LayoutGrid size={iconSize} className={iconClassName} />;
    }
  };

  // Lista de todas as categorias
  const categories = [
    { value: null, label: 'Todas' },
    { value: 'Modelos de IA e Interfaces', label: 'Modelos de IA' },
    { value: 'Geração de Conteúdo Visual', label: 'Conteúdo Visual' },
    { value: 'Geração e Processamento de Áudio', label: 'Áudio' },
    { value: 'Automação e Integrações', label: 'Automação' },
    { value: 'Comunicação e Atendimento', label: 'Comunicação' },
    { value: 'Captura e Análise de Dados', label: 'Análise de Dados' },
    { value: 'Pesquisa e Síntese de Informações', label: 'Pesquisa' },
    { value: 'Gestão de Documentos e Conteúdo', label: 'Documentos' },
    { value: 'Marketing e CRM', label: 'Marketing' },
    { value: 'Produtividade e Organização', label: 'Produtividade' },
    { value: 'Desenvolvimento e Código', label: 'Desenvolvimento' },
    { value: 'Plataformas de Mídia', label: 'Mídia' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full mb-lg"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-sm">
        {categories.map((category) => (
          <CategoryCard
            key={category.value || 'all'}
            category={category.value}
            label={category.label}
            icon={getCategoryIcon(category.value)}
            count={categoryCounts[category.value || 'all'] || 0}
            isSelected={selectedCategory === category.value}
            onClick={() => onCategoryChange(category.value)}
          />
        ))}
      </div>
    </motion.div>
  );
};
