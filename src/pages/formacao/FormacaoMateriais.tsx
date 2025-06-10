
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { LearningResource } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, FileText, Download, ExternalLink, Loader2 } from "lucide-react";
import { RecursoFormDialog } from "@/components/formacao/materiais/RecursoFormDialog";
import { RecursoDeleteDialog } from "@/components/formacao/materiais/RecursoDeleteDialog";
import { RecursosList } from "@/components/formacao/materiais/RecursosList";

const FormacaoMateriais = () => {
  const { profile } = useAuth();
  const [recursos, setRecursos] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<LearningResource | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recursoToDelete, setRecursoToDelete] = useState<LearningResource | null>(null);

  // Buscar recursos
  const fetchRecursos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select(`
          *,
          lesson:learning_lessons(id, title),
          course:learning_courses(id, title)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setRecursos(data || []);
    } catch (error) {
      console.error("Erro ao buscar recursos:", error);
      toast.error("Não foi possível carregar os recursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecursos();
  }, []);

  // Filtrar recursos
  const filteredRecursos = recursos.filter(recurso => {
    const matchesSearch = !searchQuery || 
      recurso.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recurso.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'todos' || 
      (activeTab === 'arquivos' && recurso.resource_type === 'file') ||
      (activeTab === 'links' && recurso.resource_type === 'link') ||
      (activeTab === 'videos' && recurso.resource_type === 'video');
    
    return matchesSearch && matchesTab;
  });

  // Estatísticas
  const stats = {
    total: recursos.length,
    arquivos: recursos.filter(r => r.resource_type === 'file').length,
    links: recursos.filter(r => r.resource_type === 'link').length,
    videos: recursos.filter(r => r.resource_type === 'video').length
  };

  // Handlers
  const handleNovoRecurso = () => {
    setEditingRecurso(null);
    setIsFormDialogOpen(true);
  };

  const handleEditarRecurso = (recurso: LearningResource) => {
    setEditingRecurso(recurso);
    setIsFormDialogOpen(true);
  };

  const handleExcluirRecurso = (recurso: LearningResource) => {
    setRecursoToDelete(recurso);
    setDeleteDialogOpen(true);
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

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Materiais de Apoio</h1>
          <p className="text-muted-foreground">Gerencie recursos, arquivos e materiais do LMS</p>
        </div>
        
        {isAdmin && (
          <Button onClick={handleNovoRecurso}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Material
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arquivos</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.arquivos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Links</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.links}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vídeos</CardTitle>
            <div className="h-4 w-4 bg-primary rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.videos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar materiais..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Tabs e Lista */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todos">Todos ({stats.total})</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos ({stats.arquivos})</TabsTrigger>
          <TabsTrigger value="links">Links ({stats.links})</TabsTrigger>
          <TabsTrigger value="videos">Vídeos ({stats.videos})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <RecursosList 
              recursos={filteredRecursos}
              onEdit={handleEditarRecurso}
              onDelete={handleExcluirRecurso}
              isAdmin={isAdmin}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <RecursoFormDialog 
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        recurso={editingRecurso}
        onSuccess={handleSalvarRecurso}
      />
      
      <RecursoDeleteDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        recursoName={recursoToDelete?.name || ''}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default FormacaoMateriais;
