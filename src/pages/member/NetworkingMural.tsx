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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-aurora via-viverblue to-operational bg-clip-text text-transparent">
            Mural de Oportunidades
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Descubra e compartilhe oportunidades de negócio com a comunidade
          </p>
        </div>
        <Button 
          onClick={() => setIsPostModalOpen(true)} 
          size="lg" 
          className="bg-gradient-to-r from-aurora to-viverblue hover:from-aurora/90 hover:to-viverblue/90 text-white shadow-lg shadow-aurora/20 hover:shadow-aurora/40 transition-all duration-200 gap-2 px-6 py-6 text-base font-semibold"
        >
          <Plus className="w-5 h-5" />
          Postar Oportunidade
        </Button>
      </div>

      {/* Filtros */}
      <div className="liquid-glass-card p-4 rounded-2xl border border-white/10 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar oportunidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base liquid-glass-card border-aurora/20 focus:border-aurora"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[240px] h-12 text-base liquid-glass-card border-aurora/20">
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
