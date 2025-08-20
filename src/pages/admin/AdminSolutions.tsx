
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  BookOpen, 
  Eye, 
  Globe,
  EyeOff,
  Plus,
  Filter,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useSolutionsAdmin } from '@/hooks/admin/useSolutionsAdmin';
import { SolutionsTable } from '@/components/admin/solutions/SolutionsTable';
import { DeleteSolutionDialog } from '@/components/admin/solutions/DeleteSolutionDialog';
import { getCategoryDetails } from '@/lib/types/categoryTypes';

const AdminSolutions = () => {
  const {
    solutions,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    solutionToDelete,
    setSolutionToDelete,
    handleDeleteConfirm,
    handleEdit,
    handleDelete,
    handleTogglePublish,
    handleCreateNew,
    totalSolutions,
    publishedSolutions
  } = useSolutionsAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Enhanced stats calculation
  const draftSolutions = solutions.filter(s => !s.published).length;
  const recentSolutions = solutions.filter(s => {
    const solutionDate = new Date(s.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return solutionDate > weekAgo;
  }).length;

  const categoriesCount = new Set(solutions.map(s => s.category)).size;

  // Filter and search logic
  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = solution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (solution.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || solution.category === filterCategory;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && solution.published) ||
                         (filterStatus === 'draft' && !solution.published);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories from solutions
  const availableCategories = [...new Set(solutions.map(s => s.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-viverblue/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-operational/10 to-strategy/10 blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-revenue/10 to-viverblue/10 blur-3xl animate-blob animation-delay-2000" />
      
      <div className="relative p-6 md:p-8 space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-viverblue/20 to-operational/20 backdrop-blur-sm border border-viverblue/20">
                <FileText className="h-8 w-8 text-viverblue" />
              </div>
              <div>
                <h1 className="text-display text-foreground bg-gradient-to-r from-viverblue to-operational bg-clip-text text-transparent">
                  Soluções
                </h1>
                <p className="text-body-large text-muted-foreground">
                  Gerencie {totalSolutions} soluções disponíveis na plataforma
                </p>
              </div>
            </div>
            
            {/* Quick Stats Badges */}
            <div className="flex gap-4">
              <Badge variant="secondary" className="surface-elevated">
                {publishedSolutions} Publicadas
              </Badge>
              <Badge variant="secondary" className="surface-elevated">
                {draftSolutions} Rascunhos
              </Badge>
              <Badge variant="secondary" className="surface-elevated">
                {recentSolutions} Novas (7d)
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={loading}
              className="aurora-focus gap-2 bg-card/50 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4" />
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
            
            <Button
              onClick={handleCreateNew}
              className="aurora-focus gap-2 bg-gradient-to-r from-viverblue to-operational hover:from-viverblue/90 hover:to-operational/90"
            >
              <Plus className="h-4 w-4" />
              Nova Solução
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Total</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-viverblue/20 to-viverblue/10 transition-all duration-300 group-hover:from-viverblue/30 group-hover:to-viverblue/20">
                <FileText className="h-4 w-4 text-viverblue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-viverblue to-viverblue/80 bg-clip-text text-transparent">
                {totalSolutions}
              </div>
              <p className="text-caption text-muted-foreground">
                Soluções criadas
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Publicadas</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-revenue/20 to-revenue/10 transition-all duration-300 group-hover:from-revenue/30 group-hover:to-revenue/20">
                <Globe className="h-4 w-4 text-revenue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-revenue to-revenue/80 bg-clip-text text-transparent">
                {publishedSolutions}
              </div>
              <p className="text-caption text-muted-foreground">
                {Math.round((publishedSolutions / totalSolutions) * 100)}% do total
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Rascunhos</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-strategy/20 to-strategy/10 transition-all duration-300 group-hover:from-strategy/30 group-hover:to-strategy/20">
                <Clock className="h-4 w-4 text-strategy" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-strategy to-strategy/80 bg-clip-text text-transparent">
                {draftSolutions}
              </div>
              <p className="text-caption text-muted-foreground">
                Em desenvolvimento
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Categorias</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-operational/20 to-operational/10 transition-all duration-300 group-hover:from-operational/30 group-hover:to-operational/20">
                <Target className="h-4 w-4 text-operational" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-operational to-operational/80 bg-clip-text text-transparent">
                {categoriesCount}
              </div>
              <p className="text-caption text-muted-foreground">
                Tipos diferentes
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Recentes</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-surface-accent/20 to-surface-accent/10 transition-all duration-300 group-hover:from-surface-accent/30 group-hover:to-surface-accent/20">
                <TrendingUp className="h-4 w-4 text-surface-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-surface-accent to-surface-accent/80 bg-clip-text text-transparent">
                {recentSolutions}
              </div>
              <p className="text-caption text-muted-foreground">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader>
            <CardTitle className="text-heading-3 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar soluções por título ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="aurora-focus pl-10"
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background aurora-focus"
                >
                  <option value="all">Todas as categorias</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{getCategoryDetails(category).name}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-40">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background aurora-focus"
                >
                  <option value="all">Todos os status</option>
                  <option value="published">Publicadas</option>
                  <option value="draft">Rascunhos</option>
                </select>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterStatus('all');
                }}
                className="aurora-focus"
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Solutions Display */}
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader>
            <CardTitle className="text-heading-3 flex items-center justify-between">
              <span>Lista de Soluções</span>
              <Badge variant="outline" className="text-xs">
                {filteredSolutions.length} de {totalSolutions}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viverblue mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando soluções...</p>
              </div>
            ) : filteredSolutions.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 backdrop-blur-sm border border-muted/20 inline-block mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-heading-3 text-foreground mb-2">
                  {searchQuery || filterCategory !== 'all' || filterStatus !== 'all' 
                    ? 'Nenhuma solução encontrada' 
                    : 'Nenhuma solução criada ainda'}
                </h3>
                <p className="text-body text-muted-foreground mb-4">
                  {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                    ? 'Tente ajustar os filtros para encontrar o que procura'
                    : 'Crie sua primeira solução para começar a compartilhar conhecimento'}
                </p>
                {!(searchQuery || filterCategory !== 'all' || filterStatus !== 'all') && (
                  <Button onClick={handleCreateNew} className="aurora-focus">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Solução
                  </Button>
                )}
              </div>
            ) : (
              <SolutionsTable 
                solutions={filteredSolutions}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
                getCategoryDetails={getCategoryDetails}
                onDeleteClick={(id) => {
                  setSolutionToDelete(id);
                  setDeleteDialogOpen(true);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteSolutionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminSolutions;
