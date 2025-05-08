
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, LearningLesson, LearningModule } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Edit, Play, Download, Calendar, BookOpen, User, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import VideoPlayer from '@/components/formacao/comum/VideoPlayer';

const FormacaoAulaDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [aula, setAula] = useState<LearningLesson | null>(null);
  const [modulo, setModulo] = useState<LearningModule | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [recursos, setRecursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visao-geral');

  useEffect(() => {
    const fetchAula = async () => {
      if (!id) {
        toast.error("ID da aula não fornecido");
        navigate('/formacao/aulas');
        return;
      }

      try {
        setLoading(true);
        
        // Buscar a aula
        const { data: aulaData, error: aulaError } = await supabase
          .from('learning_lessons')
          .select('*')
          .eq('id', id)
          .single();

        if (aulaError) {
          throw aulaError;
        }

        setAula(aulaData as LearningLesson);

        // Buscar o módulo da aula
        if (aulaData.module_id) {
          const { data: moduloData, error: moduloError } = await supabase
            .from('learning_modules')
            .select('*, learning_courses:course_id(*)')
            .eq('id', aulaData.module_id)
            .single();

          if (moduloError) {
            console.error("Erro ao buscar módulo:", moduloError);
          } else {
            setModulo(moduloData as any);
          }
        }

        // Buscar vídeos da aula
        const { data: videosData, error: videosError } = await supabase
          .from('learning_lesson_videos')
          .select('*')
          .eq('lesson_id', id)
          .order('order_index');

        if (videosError) {
          console.error("Erro ao buscar vídeos:", videosError);
        } else {
          setVideos(videosData || []);
        }

        // Buscar recursos da aula
        const { data: recursosData, error: recursosError } = await supabase
          .from('learning_resources')
          .select('*')
          .eq('lesson_id', id)
          .order('order_index');

        if (recursosError) {
          console.error("Erro ao buscar recursos:", recursosError);
        } else {
          setRecursos(recursosData || []);
        }

      } catch (error: any) {
        console.error("Erro ao buscar aula:", error);
        toast.error("Erro ao carregar aula: " + error.message);
        navigate('/formacao/aulas');
      } finally {
        setLoading(false);
      }
    };

    fetchAula();
  }, [id, navigate]);

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return 'Iniciante';
    }
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  // Função para navegar para a página de edição
  const handleEditAula = () => {
    navigate(`/formacao/aulas/${id}/editar`);
  };

  // Função para alternar a publicação da aula
  const handleTogglePublicacao = async () => {
    if (!aula) return;

    try {
      const novoStatus = !aula.published;
      
      const { error } = await supabase
        .from('learning_lessons')
        .update({ published: novoStatus })
        .eq('id', aula.id);

      if (error) throw error;

      setAula({ ...aula, published: novoStatus });
      toast.success(`Aula ${novoStatus ? 'publicada' : 'despublicada'} com sucesso!`);
    } catch (error: any) {
      console.error("Erro ao alterar status de publicação:", error);
      toast.error(`Erro ao ${aula.published ? 'despublicar' : 'publicar'} aula: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Carregando aula...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header com navegação de volta e ações */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/formacao/aulas')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para aulas
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleEditAula}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar Aula
          </Button>
          <Button 
            variant={aula?.published ? "destructive" : "default"}
            onClick={handleTogglePublicacao}
          >
            {aula?.published ? 'Despublicar' : 'Publicar'}
          </Button>
        </div>
      </div>

      {/* Título da aula e informações */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {modulo && (
            <Badge variant="outline" className="text-xs">
              Módulo: {modulo.title}
            </Badge>
          )}
          <Badge className={`${getDifficultyColor(aula?.difficulty_level)}`}>
            {getDifficultyLabel(aula?.difficulty_level)}
          </Badge>
          {aula?.published ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">Publicada</Badge>
          ) : (
            <Badge variant="outline" className="text-amber-500 border-amber-500">Não publicada</Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold">{aula?.title}</h1>
        {aula?.description && (
          <p className="text-muted-foreground">{aula.description}</p>
        )}
      </div>

      {/* Tabs para diferentes seções da aula */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="videos">Vídeos ({videos.length})</TabsTrigger>
          <TabsTrigger value="materiais">Materiais ({recursos.length})</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Visão geral da aula */}
        <TabsContent value="visao-geral" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Aula</CardTitle>
              <CardDescription>Detalhes sobre a aula e seu conteúdo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Data de criação</p>
                    <p className="text-sm text-muted-foreground">
                      {aula?.created_at ? new Date(aula.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tempo estimado</p>
                    <p className="text-sm text-muted-foreground">
                      {aula?.estimated_time_minutes ? `${aula.estimated_time_minutes} min` : 'Não definido'}
                    </p>
                  </div>
                </div>
              </div>

              {aula?.cover_image_url && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Imagem de capa</p>
                  <div className="aspect-video w-full max-w-md mx-auto overflow-hidden rounded-md bg-muted">
                    <img 
                      src={aula.cover_image_url} 
                      alt={`Capa da aula ${aula.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              {aula?.ai_assistant_enabled && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <h3 className="font-medium">Assistente de IA ativado</h3>
                  {aula.ai_assistant_prompt && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ID do assistente: {aula.ai_assistant_prompt}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {videos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview do Vídeo Principal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video overflow-hidden rounded-md bg-muted">
                  <VideoPlayer 
                    videoUrl={videos[0].url} 
                    videoType={videos[0].video_type || 'youtube'}
                    thumbnailUrl={videos[0].thumbnail_url}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vídeos da aula */}
        <TabsContent value="videos" className="space-y-4 pt-4">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {videos.map((video, index) => (
                <Card key={video.id}>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{video.title || `Vídeo ${index + 1}`}</CardTitle>
                        {video.description && (
                          <CardDescription>{video.description}</CardDescription>
                        )}
                      </div>
                      <Badge>{video.video_type || 'youtube'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="aspect-video overflow-hidden rounded-md bg-muted">
                      <VideoPlayer 
                        videoUrl={video.url}
                        videoType={video.video_type || 'youtube'}
                        thumbnailUrl={video.thumbnail_url}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <List className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="mt-4 text-lg font-medium">Nenhum vídeo encontrado</h3>
              <p className="text-muted-foreground">Esta aula não possui vídeos cadastrados.</p>
            </div>
          )}
        </TabsContent>

        {/* Materiais e recursos */}
        <TabsContent value="materiais" className="space-y-4 pt-4">
          {recursos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {recursos.map((recurso) => (
                <Card key={recurso.id}>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{recurso.name}</CardTitle>
                        {recurso.description && (
                          <CardDescription>{recurso.description}</CardDescription>
                        )}
                      </div>
                      <Badge variant="outline">{recurso.file_type || 'documento'}</Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild variant="outline" className="gap-2">
                      <a href={recurso.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <List className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="mt-4 text-lg font-medium">Nenhum material encontrado</h3>
              <p className="text-muted-foreground">Esta aula não possui materiais cadastrados.</p>
            </div>
          )}
        </TabsContent>

        {/* Estatísticas da aula */}
        <TabsContent value="estatisticas" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Visualização</CardTitle>
              <CardDescription>Métricas de desempenho da aula</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="mt-4 text-lg font-medium">Funcionalidade em desenvolvimento</h3>
                <p className="text-muted-foreground">As estatísticas detalhadas estarão disponíveis em breve.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormacaoAulaDetalhes;
