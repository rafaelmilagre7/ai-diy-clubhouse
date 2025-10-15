import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminOpportunities, useAdminToggleOpportunity, useAdminDeleteOpportunity } from '@/hooks/admin/useAdminOpportunities';
import { OpportunityTable } from '@/components/admin/networking/OpportunityTable';
import { OpportunityDetailModal } from '@/components/admin/networking/OpportunityDetailModal';
import { Opportunity } from '@/hooks/networking/useOpportunities';

const OpportunitiesManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { data: opportunities, isLoading } = useAdminOpportunities({
    type: typeFilter,
    status: statusFilter,
    searchQuery: searchQuery.trim(),
  });

  const toggleMutation = useAdminToggleOpportunity();
  const deleteMutation = useAdminDeleteOpportunity();

  const handleView = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setDetailModalOpen(true);
  };

  const handleToggle = (id: string, isActive: boolean) => {
    toggleMutation.mutate({ id, isActive });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta oportunidade? Esta ação não pode ser desfeita.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestão de Oportunidades</h1>
        <p className="text-muted-foreground">
          Gerencie todas as oportunidades de negócio publicadas na plataforma
        </p>
      </div>

      {/* Filters */}
      <div className="liquid-glass-card p-4 rounded-xl border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
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

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="inactive">Inativas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>
            {opportunities?.length || 0} oportunidade(s) encontrada(s)
          </span>
        </div>
      </div>

      {/* Table */}
      <OpportunityTable
        opportunities={opportunities || []}
        onView={handleView}
        onToggle={handleToggle}
        onDelete={handleDelete}
        loading={isLoading}
      />

      {/* Detail Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default OpportunitiesManagement;
