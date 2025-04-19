
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolCategory } from '@/types/toolTypes';

interface ToolsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories: { value: string | null; label: string }[] = [
  { value: null, label: 'Todas' },
  { value: 'Modelos de IA e Interfaces', label: 'Modelos de IA e Interfaces' },
  { value: 'Geração de Conteúdo Visual', label: 'Geração de Conteúdo Visual' },
  { value: 'Geração e Processamento de Áudio', label: 'Geração e Processamento de Áudio' },
  { value: 'Automação e Integrações', label: 'Automação e Integrações' },
  { value: 'Comunicação e Atendimento', label: 'Comunicação e Atendimento' },
  { value: 'Captura e Análise de Dados', label: 'Captura e Análise de Dados' },
  { value: 'Pesquisa e Síntese de Informações', label: 'Pesquisa e Síntese de Informações' },
  { value: 'Gestão de Documentos e Conteúdo', label: 'Gestão de Documentos e Conteúdo' },
  { value: 'Marketing e CRM', label: 'Marketing e CRM' },
  { value: 'Produtividade e Organização', label: 'Produtividade e Organização' },
  { value: 'Desenvolvimento e Código', label: 'Desenvolvimento e Código' },
  { value: 'Plataformas de Mídia', label: 'Plataformas de Mídia' },
];

export const ToolsHeader = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: ToolsHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ferramentas</h1>
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

      <Tabs
        defaultValue={selectedCategory || 'all'}
        className="w-full"
        onValueChange={(value) => onCategoryChange(value === 'all' ? null : value)}
      >
        <TabsList className="w-full h-auto flex flex-wrap">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value || 'all'}
              value={category.value || 'all'}
              className="flex-grow data-[state=active]:bg-[#0ABAB5]/10 data-[state=active]:text-[#0ABAB5] data-[state=active]:shadow-none"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {selectedCategory && (
        <div className="flex items-center">
          <span className="text-sm mr-2">Filtro ativo:</span>
          <Badge 
            variant="outline" 
            className="bg-[#0ABAB5]/10 text-[#0ABAB5] flex items-center gap-1"
          >
            {selectedCategory}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent text-[#0ABAB5]"
              onClick={() => onCategoryChange(null)}
            >
              ×
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
};
