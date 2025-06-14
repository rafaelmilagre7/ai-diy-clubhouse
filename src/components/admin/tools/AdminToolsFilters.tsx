
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolCategory } from '@/types/toolTypes';

interface AdminToolsFiltersProps {
  onCategoryChange: (category: ToolCategory | null) => void;
  onSearchChange: (query: string) => void;
  selectedCategory: ToolCategory | null;
  searchQuery: string;
}

export const AdminToolsFilters: React.FC<AdminToolsFiltersProps> = ({
  onCategoryChange,
  onSearchChange,
  selectedCategory,
  searchQuery
}) => {
  const categories: ToolCategory[] = [
    'Modelos de IA e Interfaces',
    'Geração de Conteúdo Visual',
    'Geração e Processamento de Áudio',
    'Automação e Integrações',
    'Comunicação e Atendimento',
    'Captura e Análise de Dados',
    'Pesquisa e Síntese de Informações',
    'Gestão de Documentos e Conteúdo',
    'Marketing e CRM',
    'Produtividade e Organização',
    'Desenvolvimento e Código',
    'Plataformas de Mídia',
    'Outros'
  ];

  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            type="search"
            placeholder="Buscar ferramenta..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 bg-[#1A1E2E] border-neutral-700 text-neutral-100 placeholder:text-neutral-400"
          />
        </div>
      </div>
      
      <Select
        value={selectedCategory || 'all'}
        onValueChange={(value) => onCategoryChange(value === 'all' ? null : value as ToolCategory)}
      >
        <SelectTrigger className="w-[200px] bg-[#1A1E2E] border-neutral-700 text-neutral-100">
          <SelectValue placeholder="Todas as categorias" />
        </SelectTrigger>
        <SelectContent className="bg-[#1A1E2E] border-neutral-700 text-neutral-100">
          <SelectItem value="all" className="hover:bg-viverblue/10 text-neutral-100">Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category} className="hover:bg-viverblue/10 text-neutral-100">
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
