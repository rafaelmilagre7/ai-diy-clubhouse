import { useState, useEffect, useRef } from 'react';
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
import { EditOpportunityModal } from '@/components/networking/mural/EditOpportunityModal';
import { DeleteConfirmDialog } from '@/components/networking/mural/DeleteConfirmDialog';
import { NewOpportunitiesBanner } from '@/components/networking/mural/NewOpportunitiesBanner';
import { TagsFilter } from '@/components/networking/mural/TagsFilter';
import { useOpportunities, useDeleteOpportunity, Opportunity } from '@/hooks/networking/useOpportunities';

const SEEN_OPPORTUNITIES_KEY = 'networking_seen_opportunities';

export default function NetworkingMural() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [deletingOpportunity, setDeletingOpportunity] = useState<Opportunity | null>(null);
  const [typeFilter, setTypeFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newOpportunityIds, setNewOpportunityIds] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const deleteMutation = useDeleteOpportunity();

  // Carregar IDs vistos do localStorage
  const [seenOpportunityIds, setSeenOpportunityIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(SEEN_OPPORTUNITIES_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Persistir IDs vistos no localStorage
  useEffect(() => {
    localStorage.setItem(SEEN_OPPORTUNITIES_KEY, JSON.stringify([...seenOpportunityIds]));
  }, [seenOpportunityIds]);

  const { data: opportunities = [], isLoading } = useOpportunities({
    type: typeFilter,
    searchQuery,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  });

  // Detectar novas oportunidades
  useEffect(() => {
    if (!opportunities || isLoading) return;

    const newIds: string[] = [];

    opportunities.forEach(opp => {
      if (!seenOpportunityIds.has(opp.id) && !opp.id.startsWith('temp-')) {
        newIds.push(opp.id);
      }
    });

    if (newIds.length > 0) {
      setNewOpportunityIds(newIds);
      setShowBanner(true);
      
      // Atualizar IDs vistos após 2 segundos
      setTimeout(() => {
        setSeenOpportunityIds(prev => new Set([...prev, ...newIds]));
      }, 2000);
    }
  }, [opportunities, isLoading, seenOpportunityIds]);

  const handleViewNewOpportunities = () => {
    setShowBanner(false);
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    setNewOpportunityIds([]);
  };

  const handleViewDetails = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    // Marcar como vista
    setSeenOpportunityIds(prev => new Set([...prev, opportunity.id]));
  };

  const handleDelete = async () => {
    if (!deletingOpportunity) return;
    
    await deleteMutation.mutateAsync(deletingOpportunity.id);
    setDeletingOpportunity(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Banner de novas oportunidades */}
      {showBanner && newOpportunityIds.length > 0 && (
        <NewOpportunitiesBanner
          count={newOpportunityIds.length}
          onViewClick={handleViewNewOpportunities}
          onDismiss={handleDismissBanner}
        />
      )}

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
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-200 gap-2 px-6 py-6 text-base font-semibold"
        >
          <Plus className="w-5 h-5" />
          Postar Oportunidade
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar oportunidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-11 text-base bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 focus:border-primary/30"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[240px] h-11 text-base bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
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

        <TagsFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} />
      </div>

      {/* Feed */}
      <div ref={feedRef}>
        <OpportunityFeed
          opportunities={opportunities}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onEdit={setEditingOpportunity}
          onDelete={setDeletingOpportunity}
          newOpportunityIds={newOpportunityIds}
          onPostClick={() => setIsPostModalOpen(true)}
        />
      </div>

      {/* Modais */}
      <PostOpportunityModal open={isPostModalOpen} onOpenChange={setIsPostModalOpen} />
      <OpportunityDetailsModal
        opportunity={selectedOpportunity}
        open={!!selectedOpportunity}
        onOpenChange={(open) => !open && setSelectedOpportunity(null)}
        onEdit={setEditingOpportunity}
        onDelete={setDeletingOpportunity}
      />
      <EditOpportunityModal
        opportunity={editingOpportunity}
        open={!!editingOpportunity}
        onOpenChange={(open) => !open && setEditingOpportunity(null)}
      />
      <DeleteConfirmDialog
        open={!!deletingOpportunity}
        onOpenChange={(open) => !open && setDeletingOpportunity(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
