
import { useState } from 'react';
import { Tool } from '@/types/toolTypes';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Edit, 
  Trash, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  EyeOff,
  Gift,
  BarChart3,
  Globe,
  Wrench
} from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAdminTools } from '@/hooks/useAdminTools';
import { ToolCategory } from '@/types/toolTypes';

interface AdminToolListProps {
  tools: Tool[];
  refreshTrigger?: number;
}

export const AdminToolList = ({ refreshTrigger }: AdminToolListProps) => {
  const { 
    tools, 
    isLoading, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    refetch,
    toolsCount
  } = useAdminTools();
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [benefitFilter, setBenefitFilter] = useState<'all' | 'with-benefits' | 'without-benefits'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'status' | 'clicks'>('name');
  const { toast } = useToast();

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

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Ferramenta excluída",
        description: "A ferramenta foi excluída com sucesso.",
      });
      
      await refetch();
      
    } catch (error: any) {
      console.error("Erro ao excluir ferramenta:", error);
      toast({
        title: "Erro ao excluir ferramenta",
        description: error.message || "Ocorreu um erro ao excluir a ferramenta.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusToggle = async (toolId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tools')
        .update({ status: !currentStatus })
        .eq('id', toolId);

      if (error) throw error;

      toast({
        title: `Ferramenta ${!currentStatus ? 'ativada' : 'desativada'}`,
        description: `Status atualizado com sucesso.`,
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Apply filters
  const filteredTools = tools.filter(tool => {
    // Status filter
    if (statusFilter === 'active' && !tool.status) return false;
    if (statusFilter === 'inactive' && tool.status) return false;
    
    // Benefit filter
    if (benefitFilter === 'with-benefits' && !tool.has_member_benefit) return false;
    if (benefitFilter === 'without-benefits' && tool.has_member_benefit) return false;
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'category':
        return a.category.localeCompare(b.category);
      case 'status':
        return Number(b.status) - Number(a.status);
      case 'clicks':
        return (b.benefit_clicks || 0) - (a.benefit_clicks || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Loading Filters */}
        <div className="aurora-glass rounded-2xl p-6 border border-aurora-primary/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-12 bg-gradient-to-r from-aurora-primary/20 to-aurora-primary/10 rounded-xl animate-pulse"></div>
            <div className="w-48 h-12 bg-gradient-to-r from-aurora-primary/20 to-aurora-primary/10 rounded-xl animate-pulse"></div>
            <div className="w-32 h-12 bg-gradient-to-r from-aurora-primary/20 to-aurora-primary/10 rounded-xl animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aurora-glass rounded-2xl border border-aurora-primary/20 backdrop-blur-md animate-pulse">
              <div className="bg-gradient-to-r from-aurora-primary/10 to-aurora-primary/5 p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-aurora-primary/20 to-aurora-primary/10 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-gradient-to-r from-aurora-primary/20 to-aurora-primary/10 rounded"></div>
                    <div className="w-20 h-3 bg-gradient-to-r from-aurora-primary/15 to-aurora-primary/8 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="w-full h-3 bg-gradient-to-r from-aurora-primary/15 to-aurora-primary/8 rounded"></div>
                <div className="w-4/5 h-3 bg-gradient-to-r from-aurora-primary/15 to-aurora-primary/8 rounded"></div>
                <div className="flex gap-2 mt-4">
                  <div className="w-16 h-8 bg-gradient-to-r from-aurora-primary/20 to-aurora-primary/10 rounded"></div>
                  <div className="w-16 h-8 bg-gradient-to-r from-aurora-primary/20 to-aurora-primary/10 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredTools.length === 0) {
    return (
      <div className="aurora-glass rounded-2xl border border-aurora-primary/20 backdrop-blur-md overflow-hidden">
        <div className="bg-gradient-to-r from-aurora-primary/10 via-aurora-primary/5 to-transparent p-8 border-b border-aurora-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-aurora-primary/20 to-aurora-primary/10 aurora-glass">
              <Wrench className="h-6 w-6 text-aurora-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold aurora-text-gradient">Ferramentas</h2>
              <p className="text-muted-foreground font-medium">
                Gerencie e organize todas as ferramentas da plataforma
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-12 text-center">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/20 to-muted/10 aurora-glass mx-auto w-fit mb-6">
            <Wrench className="h-16 w-16 text-muted-foreground" />
          </div>
          <h4 className="text-2xl font-bold aurora-text-gradient mb-4">
            {searchQuery || selectedCategory || statusFilter !== 'all' || benefitFilter !== 'all'
              ? 'Nenhuma Ferramenta Encontrada' 
              : 'Nenhuma Ferramenta Cadastrada'}
          </h4>
          <p className="text-lg text-muted-foreground mb-6">
            {searchQuery || selectedCategory || statusFilter !== 'all' || benefitFilter !== 'all'
              ? 'Ajuste os filtros para ver mais resultados ou cadastre uma nova ferramenta.' 
              : 'Comece criando sua primeira ferramenta para a plataforma.'}
          </p>
          <Link to="/admin/tools/new">
            <Button className="bg-gradient-to-r from-aurora-primary to-aurora-primary-light hover:from-aurora-primary-dark hover:to-aurora-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              {tools.length === 0 ? 'Criar Primeira Ferramenta' : 'Nova Ferramenta'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Filters Section */}
      <div className="aurora-glass rounded-2xl p-6 border border-aurora-primary/20 backdrop-blur-md">
        <div className="space-y-6">
          {/* Search and Primary Actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Search className="h-5 w-5 text-aurora-primary/70" />
              </div>
              <Input
                type="search"
                placeholder="Buscar por nome, descrição ou tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 aurora-glass border-aurora-primary/30 bg-background/50 backdrop-blur-sm focus:border-aurora-primary/50 focus:ring-aurora-primary/20 font-medium"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/admin/tools/new">
                <Button className="h-12 px-6 bg-gradient-to-r from-aurora-primary to-aurora-primary-light hover:from-aurora-primary-dark hover:to-aurora-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ferramenta
                </Button>
              </Link>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory || 'all'} onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value as ToolCategory)}>
                <SelectTrigger className="w-48 aurora-glass border-aurora-primary/30 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="aurora-glass backdrop-blur-md border-aurora-primary/30">
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-36 aurora-glass border-aurora-primary/30 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="aurora-glass backdrop-blur-md border-aurora-primary/30">
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={benefitFilter} onValueChange={(value: any) => setBenefitFilter(value)}>
                <SelectTrigger className="w-40 aurora-glass border-aurora-primary/30 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Benefícios" />
                </SelectTrigger>
                <SelectContent className="aurora-glass backdrop-blur-md border-aurora-primary/30">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="with-benefits">Com benefícios</SelectItem>
                  <SelectItem value="without-benefits">Sem benefícios</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-36 aurora-glass border-aurora-primary/30 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent className="aurora-glass backdrop-blur-md border-aurora-primary/30">
                  <SelectItem value="name">Nome A-Z</SelectItem>
                  <SelectItem value="category">Categoria</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="clicks">Popularidade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Counter */}
            {(searchQuery || selectedCategory || statusFilter !== 'all' || benefitFilter !== 'all') && (
              <div className="text-sm text-muted-foreground flex items-center gap-2 ml-auto">
                <div className="w-2 h-2 bg-aurora-primary rounded-full aurora-pulse"></div>
                Exibindo <span className="font-bold text-aurora-primary">{filteredTools.length}</span> de <span className="font-bold">{tools.length}</span> ferramentas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool, index) => (
          <div 
            key={tool.id} 
            className="aurora-glass rounded-2xl border border-muted/20 backdrop-blur-md overflow-hidden group hover:border-aurora-primary/30 transition-all duration-500 hover:shadow-2xl animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Enhanced Header */}
            <div className={`bg-gradient-to-r ${
              tool.status 
                ? 'from-success/10 via-aurora-primary/5 to-transparent' 
                : 'from-muted/10 via-muted/5 to-transparent'
            } p-6 border-b border-white/10`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                      tool.status 
                        ? 'from-aurora-primary/20 to-aurora-primary/10' 
                        : 'from-muted/20 to-muted/10'
                    } aurora-glass flex items-center justify-center overflow-hidden`}>
                      {tool.logo_url ? (
                        <img 
                          src={tool.logo_url} 
                          alt={tool.name} 
                          className="w-full h-full object-contain" 
                        />
                      ) : (
                        <div className={`text-lg font-bold ${
                          tool.status ? 'text-aurora-primary' : 'text-muted-foreground'
                        }`}>
                          {tool.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {tool.has_member_benefit && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-strategy to-accent rounded-full flex items-center justify-center">
                        <Gift className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate text-lg group-hover:text-aurora-primary transition-colors">
                      {tool.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          tool.status
                            ? 'bg-aurora-primary/10 text-aurora-primary border-aurora-primary/30'
                            : 'bg-muted/10 text-muted-foreground border-muted/30'
                        }`}
                      >
                        {tool.category}
                      </Badge>
                      {!tool.status && (
                        <Badge variant="outline" className="text-xs bg-status-error/10 text-status-error border-status-error/30">
                          Inativa
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="aurora-glass backdrop-blur-md border-muted/30">
                    <DropdownMenuItem onClick={() => handleStatusToggle(tool.id, tool.status)}>
                      {tool.status ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href={tool.official_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Ver Site Oficial
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="p-6 flex-1">
              <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                {tool.description}
              </p>
              
              {/* Performance Metrics */}
              {tool.has_member_benefit && (
                <div className="mt-4 p-3 aurora-glass rounded-lg bg-gradient-to-r from-strategy/5 to-accent/5 border border-strategy/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-strategy" />
                      <span className="text-sm font-medium text-strategy">Cliques no Benefício</span>
                    </div>
                    <Badge variant="outline" className="bg-strategy/10 text-strategy border-strategy/30">
                      {tool.benefit_clicks || 0}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Footer */}
            <div className="p-6 pt-0 flex items-center justify-between">
              <div className="flex gap-2">
                <Link to={`/admin/tools/${tool.id}`}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="aurora-glass border-operational/30 hover:border-operational/50 hover:bg-operational/10 text-operational font-medium backdrop-blur-sm transition-all duration-300"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={deletingId === tool.id}
                      className="aurora-glass border-status-error/30 hover:border-status-error/50 hover:bg-status-error/10 text-status-error font-medium backdrop-blur-sm transition-all duration-300"
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      {deletingId === tool.id ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="aurora-glass backdrop-blur-md border-status-error/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a ferramenta "{tool.name}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(tool.id)}
                        className="bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive/80"
                      >
                        Excluir Permanentemente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              <a href={tool.official_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="text-operational hover:bg-operational/10 hover:text-operational">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
