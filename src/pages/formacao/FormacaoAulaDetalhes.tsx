import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { LearningLesson, LearningResource, LearningLessonVideo, LearningModule } from "@/lib/supabase";
import { toast } from "sonner";
import { AulaHeader } from "@/components/formacao/aulas/AulaHeader";
import AulaWizard from "@/components/formacao/aulas/AulaWizard";
import { RecursosList } from "@/components/formacao/materiais/RecursosList";
import { RecursoFormDialog } from "@/components/formacao/materiais/RecursoFormDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, File, Video, Edit, Upload } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";

// Adicionar interface temporária para lidar com os novos campos até que os tipos sejam atualizados
interface VideoWithType extends Omit<LearningLessonVideo, 'video_type'> {
  video_type: string; // Tornando video_type obrigatório para resolver erro de tipo
}

const FormacaoAulaDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { logError } = useLogging();
  
  const [aula, setAula] = useState<LearningLesson | null>(null);
  const [modulo, setModulo] = useState<LearningModule | null>(null);
  const [recursos, setRecursos] = useState<LearningResource[]>([]);
  const [videos, setVideos] = useState<VideoWithType[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingRecursos, setLoadingRecursos] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  
  const [isAulaWizardOpen, setIsAulaWizardOpen] = useState(false);
  const [isRecursoDialogOpen, setIsRecursoDialogOpen] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<LearningResource | null>(null);
  const [activeTab, setActiveTab] = useState("detalhes");

  // Buscar detalhes da aula
  const fetchAula = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      console.log("Dados da aula carregados:", data);
      setAula(data);
      
      // Buscar dados do módulo separadamente
      if (data.module_id) {
        const { data: moduleData, error: moduleError } = await supabase
          .from('learning_modules')
          .select('*, learning_courses(id, title)')
          .eq('id', data.module_id)
          .single();
        
        if (!moduleError && moduleData) {
          console.log("Dados do módulo carregados:", moduleData);
          setModulo(moduleData);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar aula:", error);
      logError("fetch_aula_error", error);
      toast.error("Não foi possível carregar a aula");
      navigate('/formacao/aulas');
    } finally {
      setLoading(false);
    }
  };

  // Buscar recursos da aula
  const fetchRecursos = async () => {
    if (!id) return;
    
    setLoadingRecursos(true);
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('lesson_id', id)
        .order('order_index');
      
      if (error) throw error;
      
      console.log("Recursos carregados:", data);
      setRecursos(data || []);
    } catch (error) {
      console.error("Erro ao buscar recursos:", error);
      logError("fetch_recursos_error", error);
    } finally {
      setLoadingRecursos(false);
    }
  };

  // Buscar vídeos da aula
  const fetchVideos = async () => {
    if (!id) return;
    
    setLoadingVideos(true);
    try {
      const { data, error } = await supabase
        .from('learning_lesson_videos')
        .select('*')
        .eq('lesson_id', id)
        .order('order_index');
      
      if (error) throw error;
      
      console.log("Vídeos carregados:", data);
      setVideos(data || []);
    } catch (error) {
      console.error("Erro ao buscar vídeos:", error);
      logError("fetch_videos_error", error);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchAula();
    fetchRecursos();
    fetchVideos();
  }, [id]);

  // Abrir modal para editar aula
  const handleEditarAula = () => {
    console.log("Abrindo modal para editar aula:", aula);
    if (aula) {
      setIsAulaWizardOpen(true);
    }
  };

  // Ações após salvar aula
  const handleSalvarAula = () => {
    console.log("Aula salva com sucesso, recarregando dados...");
    setIsAulaWizardOpen(false);
    // Recarregar todos os dados relevantes
    fetchAula();
    fetchVideos();
    
    // Alternar para a aba de vídeos se estiver na aba de vídeos
    if (activeTab === "videos") {
      // Um pequeno delay para garantir que a UI seja atualizada após a busca de dados
      setTimeout(() => {
        setActiveTab("videos");
      }, 300);
    }
    
    toast.success("Dados da aula atualizados");
  };

  // Abrir modal para adicionar recurso
  const handleNovoRecurso = () => {
    setEditingRecurso(null);
    setIsRecursoDialogOpen(true);
  };

  // Abrir modal para editar recurso existente
  const handleEditarRecurso = (recurso: LearningResource) => {
    setEditingRecurso(recurso);
    setIsRecursoDialogOpen(true);
  };

  // Excluir recurso
  const handleExcluirRecurso = async (recursoId: string) => {
    try {
      const { error } = await supabase
        .from('learning_resources')
        .delete()
        .eq('id', recursoId);
      
      if (error) throw error;
      
      toast.success("Material excluído com sucesso!");
      fetchRecursos();
    } catch (error) {
      console.error("Erro ao excluir recurso:", error);
      logError("delete_recurso_error", error);
      toast.error("Não foi possível excluir o material. Tente novamente.");
    }
  };

  // Ações após salvar recurso
  const handleSalvarRecurso = () => {
    setIsRecursoDialogOpen(false);
    fetchRecursos();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!aula) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Aula não encontrada</h2>
        <p className="text-muted-foreground mt-2 mb-4">A aula que você está procurando não existe ou foi removida.</p>
        <Button onClick={() => navigate('/formacao/aulas')}>Voltar para Aulas</Button>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';
  const moduloId = modulo?.id || aula.module_id || '';

  // Função para renderizar vídeo de acordo com o tipo
  const renderVideo = (video: VideoWithType) => {
    const videoType = video.video_type || 'youtube';
    
    if (videoType === 'panda') {
      // Extrair o ID do vídeo do Panda
      const pandaVideoId = video.video_file_path || 
                          (video.url?.includes('/embed/') ? 
                            video.url.split('/embed/')[1]?.split('?')[0] : 
                            video.url?.split('/').pop());
      
      if (pandaVideoId) {
        return (
          <div className="aspect-video w-full">
            <PandaVideoPlayerEnhanced 
              videoId={pandaVideoId} 
              title={video.title}
              onProgress={(progress) => {
                console.log(`Progresso do vídeo: ${progress}%`);
              }}
              onEnded={() => {
                console.log(`Vídeo finalizado: ${video.title}`);
              }}
            />
          </div>
        );
      }
    } else if (videoType === 'youtube') {
      return (
        <iframe 
          src={video.url} 
          className="w-full h-full aspect-video"
          title={video.title}
          allowFullScreen
        />
      );
    } else if (videoType === 'file') {
      return (
        <video 
          src={video.url} 
          controls
          className="w-full h-full aspect-video"
          title={video.title}
        />
      );
    }
    
    return <div>Formato de vídeo não suportado</div>;
  };

  return (
    <div className="space-y-6">
      <AulaHeader 
        aula={aula} 
        onEditar={handleEditarAula} 
        isAdmin={isAdmin} 
        moduloId={moduloId}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="detalhes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Aula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Título</h3>
                  <p className="text-muted-foreground">{aula.title}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ordem no Módulo</h3>
                  <p className="text-muted-foreground">{aula.order_index || 0}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Duração Estimada</h3>
                  <p className="text-muted-foreground">
                    {aula.estimated_time_minutes 
                      ? `${aula.estimated_time_minutes} minutos` 
                      : 'Não definida'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Status</h3>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    aula.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {aula.published ? 'Publicada' : 'Rascunho'}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                  <p className="text-muted-foreground">{aula.description || 'Sem descrição'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Assistente de IA</h3>
                  {aula.ai_assistant_enabled ? (
                    <div className="space-y-2">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Ativado
                      </div>
                      {aula.ai_assistant_prompt && (
                        <p className="text-muted-foreground">
                          ID do Assistente: {aula.ai_assistant_prompt}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Desativado</p>
                  )}
                </div>
              </div>
              
              {/* Imagem de capa */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Imagem de Capa</h3>
                {aula.cover_image_url ? (
                  <div className="mt-2 border rounded-lg overflow-hidden max-w-md">
                    <img 
                      src={aula.cover_image_url} 
                      alt="Capa da aula" 
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sem imagem de capa</p>
                )}
              </div>
              
              {isAdmin && (
                <div className="pt-4 mt-6 border-t">
                  <Button onClick={handleEditarAula} className="w-full sm:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Aula
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="videos" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Video className="h-5 w-5" /> 
              Vídeos da Aula
            </h3>
            {isAdmin && (
              <Button onClick={handleEditarAula}>
                <Plus className="h-4 w-4 mr-2" />
                Gerenciar Vídeos
              </Button>
            )}
          </div>
          
          {loadingVideos ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : videos.length > 0 ? (
            <div className="grid gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="aspect-video w-full mb-4">
                      {renderVideo(video)}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <h4 className="text-lg font-medium">{video.title}</h4>
                    </div>
                    {video.description && <p className="text-muted-foreground mt-1">{video.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-background">
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum vídeo disponível</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Esta aula ainda não possui vídeos cadastrados.
              </p>
              {isAdmin && (
                <Button onClick={handleEditarAula} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Vídeos
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="materiais" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <File className="h-5 w-5" /> 
              Materiais Disponíveis
            </h3>
            {isAdmin && (
              <Button onClick={handleNovoRecurso}>
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            )}
          </div>
          
          <RecursosList
            recursos={recursos}
            loading={loadingRecursos}
            onEdit={handleEditarRecurso}
            onDelete={handleExcluirRecurso}
            isAdmin={isAdmin}
          />
        </TabsContent>
      </Tabs>
      
      {/* Componente de edição de aula */}
      <AulaWizard 
        open={isAulaWizardOpen}
        onOpenChange={setIsAulaWizardOpen}
        aula={aula}
        moduleId={aula.module_id}
        onSuccess={handleSalvarAula}
      />
      
      {/* Componente de edição de recurso */}
      <RecursoFormDialog
        open={isRecursoDialogOpen}
        onOpenChange={setIsRecursoDialogOpen}
        recurso={editingRecurso}
        lessonId={id || ''}
        onSuccess={handleSalvarRecurso}
      />
    </div>
  );
};

export default FormacaoAulaDetalhes;
