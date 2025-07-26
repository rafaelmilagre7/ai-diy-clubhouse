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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Download, ExternalLink, Loader2, Filter, BookOpen } from "lucide-react";
import { RecursoFormDialog } from "@/components/formacao/materiais/RecursoFormDialog";
import { RecursoDeleteDialog } from "@/components/formacao/materiais/RecursoDeleteDialog";
import { RecursosList } from "@/components/formacao/materiais/RecursosList";

interface RecursoWithDetails extends LearningResource {
  lesson?: {
    id: string;
    title: string;
    module?: {
      id: string;
      title: string;
      course?: {
        id: string;
        title: string;
      };
    };
  };
}

const FormacaoMateriais = () => {
  const { profile } = useAuth();
  const [recursos, setRecursos] = useState<RecursoWithDetails[]>([]);
  const [cursos, setCursos] = useState<{id: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState('todos');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<RecursoWithDetails | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recursoToDelete, setRecursoToDelete] = useState<RecursoWithDetails | null>(null);

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

  // Filtrar recursos baseado no file_type e curso
  const filteredRecursos = recursos.filter(recurso => {
    const matchesSearch = !searchQuery || 
      recurso.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recurso.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'todos' || 
      (activeTab === 'arquivos' && (recurso.file_type?.includes('pdf') || recurso.file_type?.includes('doc') || recurso.file_type?.includes('zip'))) ||
      (activeTab === 'links' && recurso.file_url?.startsWith('http')) ||
      (activeTab === 'videos' && (recurso.file_type?.includes('video') || recurso.file_url?.includes('youtube')));
    
    const matchesCourse = selectedCourse === 'todos' || 
      recurso.lesson?.module?.course?.id === selectedCourse;
    
    return matchesSearch && matchesTab && matchesCourse;
  });

  // Estatísticas baseadas nos recursos filtrados
  const stats = {
    total: filteredRecursos.length,
    arquivos: filteredRecursos.filter(r => r.file_type?.includes('pdf') || r.file_type?.includes('doc') || r.file_type?.includes('zip')).length,
    links: filteredRecursos.filter(r => r.file_url?.startsWith('http')).length,
    videos: filteredRecursos.filter(r => r.file_type?.includes('video') || r.file_url?.includes('youtube')).length
  };

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

  const isAdmin = profile?.role === 'admin';

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
              Gerencie recursos, arquivos e materiais de apoio da plataforma
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

        {/* Estatísticas */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
              <FileText className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {stats.total}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {recursos.length} no total
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
              <CardTitle className="text-sm font-medium">Links Externos</CardTitle>
              <ExternalLink className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.links}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                URLs e recursos web
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
        </div>

        {/* Filtros */}
        <Card className="bg-gradient-to-r from-card/50 to-card/30 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar materiais por nome ou descrição..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-background/50 border-0 shadow-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-48 h-12 bg-background/50 border-0 shadow-sm">
                    <SelectValue placeholder="Filtrar por curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os cursos</SelectItem>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs e Lista */}
        <Card className="bg-gradient-to-r from-card/80 to-card/60 border-0 shadow-xl">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-muted/20">
                <TabsTrigger value="todos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Todos ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="arquivos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Arquivos ({stats.arquivos})
                </TabsTrigger>
                <TabsTrigger value="links" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Links ({stats.links})
                </TabsTrigger>
                <TabsTrigger value="videos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Vídeos ({stats.videos})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                <RecursosList 
                  recursos={filteredRecursos}
                  loading={loading}
                  onEdit={handleEditarRecurso}
                  onDelete={handleExcluirRecurso}
                  isAdmin={isAdmin}
                />
              </TabsContent>
            </Tabs>
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