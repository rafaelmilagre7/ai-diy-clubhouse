import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { OpportunityFeed } from '@/components/networking/mural/OpportunityFeed';
import { PostOpportunityModal } from '@/components/networking/mural/PostOpportunityModal';
import { OpportunityDetailsModal } from '@/components/networking/mural/OpportunityDetailsModal';
import { useOpportunities, Opportunity } from '@/hooks/networking/useOpportunities';

export default function NetworkingMural() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [typeFilter, setTypeFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: opportunities = [], isLoading } = useOpportunities({
    type: typeFilter,
    searchQuery,
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mural de Oportunidades</h1>
          <p className="text-muted-foreground mt-2">
            Descubra e compartilhe oportunidades de negócio com a comunidade
          </p>
        </div>
        <Button onClick={() => setIsPostModalOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Postar Oportunidade
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar oportunidades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="parceria">🤝 Parceria</SelectItem>
            <SelectItem value="fornecedor">📦 Fornecedor</SelectItem>
            <SelectItem value="cliente">💼 Cliente</SelectItem>
            <SelectItem value="investimento">💰 Investimento</SelectItem>
            <SelectItem value="outro">🎯 Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feed */}
      <OpportunityFeed
        opportunities={opportunities}
        isLoading={isLoading}
        onViewDetails={setSelectedOpportunity}
      />

      {/* Modais */}
      <PostOpportunityModal open={isPostModalOpen} onOpenChange={setIsPostModalOpen} />
      <OpportunityDetailsModal
        opportunity={selectedOpportunity}
        open={!!selectedOpportunity}
        onOpenChange={(open) => !open && setSelectedOpportunity(null)}
      />
    </div>
  );
}
