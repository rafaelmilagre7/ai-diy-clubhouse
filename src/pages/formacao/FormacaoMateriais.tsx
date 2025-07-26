import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Download, ExternalLink, BookOpen, Clock, Heart } from "lucide-react";
import { RecursoFormDialog } from "@/components/formacao/materiais/RecursoFormDialog";
import { RecursoDeleteDialog } from "@/components/formacao/materiais/RecursoDeleteDialog";
import { RecursosList } from "@/components/formacao/materiais/RecursosList";
import { MaterialGridView } from "@/components/formacao/materiais/MaterialGridView";
import { MaterialHierarchyView } from "@/components/formacao/materiais/MaterialHierarchyView";
import { AdvancedFilters } from "@/components/formacao/materiais/AdvancedFilters";
import { ViewModeToggle } from "@/components/formacao/materiais/ViewModeToggle";
import { useMaterialFavorites } from "@/hooks/formacao/useMaterialFavorites";
import { RecursoWithDetails, MaterialFilters, ViewMode, MaterialStats } from "@/components/formacao/materiais/types";

const FormacaoMateriais = () => {
  const { profile } = useAuth();
  const { favorites, toggleFavorite } = useMaterialFavorites();
  
  // Estados principais
  const [recursos, setRecursos] = useState<RecursoWithDetails[]>([]);
  const [cursos, setCursos] = useState<{id: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Estados dos diálogos
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<RecursoWithDetails | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recursoToDelete, setRecursoToDelete] = useState<RecursoWithDetails | null>(null);
  
  // Estados dos filtros
  const [filters, setFilters] = useState<MaterialFilters>({
    search: '',
    course: 'todos',
    type: 'todos',
    dateRange: 'todos',
    sizeRange: 'todos',
    showFavorites: false
  });

  // Buscar recursos com dados completos
  const fetchRecursos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select(`
          *,
          lesson:learning_lessons(
            id, 
            title,
            module:learning_modules(
              id,
              title,
              course:learning_courses(id, title)
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("FormacaoMateriais: Recursos carregados:", data?.length || 0);
      setRecursos(data || []);
    } catch (error) {
      console.error("Erro ao buscar recursos:", error);
      toast.error("Não foi possível carregar os recursos");
    } finally {
      setLoading(false);
    }
  };

  // Buscar cursos disponíveis
  const fetchCursos = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_courses')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      setCursos(data || []);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
    }
  };

  useEffect(() => {
    fetchRecursos();
    fetchCursos();
  }, []);

  // Filtrar recursos baseado nos filtros ativos
  const filteredRecursos = useMemo(() => {
    return recursos.filter(recurso => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = recurso.name.toLowerCase().includes(searchLower);
        const matchesDescription = recurso.description?.toLowerCase().includes(searchLower);
        const matchesLesson = recurso.lesson?.title.toLowerCase().includes(searchLower);
        const matchesCourse = recurso.lesson?.module?.course?.title.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesDescription && !matchesLesson && !matchesCourse) {
          return false;
        }
      }

      // Filtro por curso
      if (filters.course !== 'todos') {
        if (recurso.lesson?.module?.course?.id !== filters.course) {
          return false;
        }
      }

      // Filtro por tipo
      if (filters.type !== 'todos') {
        const fileType = recurso.file_type?.toLowerCase() || '';
        switch (filters.type) {
          case 'pdf':
            if (!fileType.includes('pdf')) return false;
            break;
          case 'doc':
            if (!fileType.includes('doc') && !fileType.includes('word')) return false;
            break;
          case 'zip':
            if (!fileType.includes('zip') && !fileType.includes('rar')) return false;
            break;
          case 'image':
            if (!fileType.includes('image')) return false;
            break;
          case 'video':
            if (!fileType.includes('video') && !recurso.file_url?.includes('youtube')) return false;
            break;
          case 'link':
            if (!recurso.file_url?.startsWith('http')) return false;
            break;
        }
      }

      // Filtro por data
      if (filters.dateRange !== 'todos') {
        const createdAt = new Date(recurso.created_at);
        const now = new Date();
        const diffTime = now.getTime() - createdAt.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'hoje':
            if (diffDays > 1) return false;
            break;
          case 'semana':
            if (diffDays > 7) return false;
            break;
          case 'mes':
            if (diffDays > 30) return false;
            break;
          case 'trimestre':
            if (diffDays > 90) return false;
            break;
          case 'ano':
            if (diffDays > 365) return false;
            break;
        }
      }

      // Filtro por tamanho
      if (filters.sizeRange !== 'todos' && recurso.file_size_bytes) {
        const sizeInMB = recurso.file_size_bytes / (1024 * 1024);
        switch (filters.sizeRange) {
          case 'pequeno':
            if (sizeInMB >= 1) return false;
            break;
          case 'medio':
            if (sizeInMB < 1 || sizeInMB >= 10) return false;
            break;
          case 'grande':
            if (sizeInMB < 10 || sizeInMB >= 100) return false;
            break;
          case 'muito-grande':
            if (sizeInMB < 100) return false;
            break;
        }
      }

      // Filtro de favoritos
      if (filters.showFavorites) {
        if (!favorites.includes(recurso.id)) return false;
      }

      return true;
    });
  }, [recursos, filters, favorites]);

  // Estatísticas baseadas nos recursos filtrados
  const stats: MaterialStats = useMemo(() => {
    return {
      total: filteredRecursos.length,
      arquivos: filteredRecursos.filter(r => 
        r.file_type?.includes('pdf') || 
        r.file_type?.includes('doc') || 
        r.file_type?.includes('zip')
      ).length,
      links: filteredRecursos.filter(r => r.file_url?.startsWith('http')).length,
      videos: filteredRecursos.filter(r => 
        r.file_type?.includes('video') || 
        r.file_url?.includes('youtube')
      ).length,
      favoritos: favorites.length,
      recentes: recursos.filter(r => {
        const diffTime = new Date().getTime() - new Date(r.created_at).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }).length
    };
  }, [filteredRecursos, favorites, recursos]);

  // Contar filtros ativos
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.course !== 'todos') count++;
    if (filters.type !== 'todos') count++;
    if (filters.dateRange !== 'todos') count++;
    if (filters.sizeRange !== 'todos') count++;
    if (filters.showFavorites) count++;
    return count;
  }, [filters]);

  // Handlers
  const handleNovoRecurso = () => {
    setEditingRecurso(null);
    setIsFormDialogOpen(true);
  };

  const handleEditarRecurso = (recurso: RecursoWithDetails) => {
    setEditingRecurso(recurso);
    setIsFormDialogOpen(true);
  };

  const handleExcluirRecurso = (recursoId: string) => {
    const recurso = recursos.find(r => r.id === recursoId);
    if (recurso) {
      setRecursoToDelete(recurso);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!recursoToDelete) return;
    
    try {
      const { error } = await supabase
        .from('learning_resources')
        .delete()
        .eq('id', recursoToDelete.id);
      
      if (error) throw error;
      
      toast.success("Recurso excluído com sucesso!");
      fetchRecursos();
      setDeleteDialogOpen(false);
      setRecursoToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir recurso:", error);
      toast.error("Não foi possível excluir o recurso");
    }
  };

  const handleSalvarRecurso = () => {
    setIsFormDialogOpen(false);
    fetchRecursos();
  };

  const handleBulkDownload = () => {
    toast.info("Funcionalidade de download em lote será implementada em breve!");
  };

  const isAdmin = profile?.role === 'admin';

  // Renderizar conteúdo baseado no modo de visualização
  const renderContent = () => {
    const sharedProps = {
      recursos: filteredRecursos,
      loading,
      onEdit: handleEditarRecurso,
      onDelete: handleExcluirRecurso,
      isAdmin
    };

    switch (viewMode) {
      case 'grid':
        return (
          <MaterialGridView 
            {...sharedProps}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
          />
        );
      case 'hierarchy':
        return <MaterialHierarchyView {...sharedProps} />;
      default:
        return <RecursosList {...sharedProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-cyan-300/10 to-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Central de Materiais
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Hub central de recursos, arquivos e materiais educacionais
            </p>
          </div>
          
          {isAdmin && (
            <Button 
              onClick={handleNovoRecurso}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Material
            </Button>
          )}
        </div>

        {/* Estatísticas Expandidas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {stats.total}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de {recursos.length} materiais
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arquivos</CardTitle>
              <Download className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.arquivos}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                PDFs, DOCs, ZIPs
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Links</CardTitle>
              <ExternalLink className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.links}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recursos externos
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vídeos</CardTitle>
              <div className="h-5 w-5 bg-gradient-to-r from-red-500 to-purple-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
                {stats.videos}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Conteúdo audiovisual
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
              <Heart className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats.favoritos}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Seus preferidos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recentes</CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats.recentes}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Última semana
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Avançados */}
        <AdvancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          cursos={cursos}
          activeFilterCount={activeFilterCount}
        />

        {/* Toggle de Visualização */}
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onBulkDownload={handleBulkDownload}
        />

        {/* Conteúdo Principal */}
        <Card className="bg-gradient-to-r from-card/80 to-card/60 border-0 shadow-xl">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              renderContent()
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <RecursoFormDialog 
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          recurso={editingRecurso}
          lessonId=""
          onSuccess={handleSalvarRecurso}
        />
        
        <RecursoDeleteDialog 
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          recurso={recursoToDelete}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

export default FormacaoMateriais;