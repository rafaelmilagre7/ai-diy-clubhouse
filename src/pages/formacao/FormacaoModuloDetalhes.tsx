import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BookOpen,
  Video,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { getUserRoleName } from '@/lib/supabase/types';

interface ModuleData {
  id: string;
  title: string;
  description: string;
  content: any;
  duration_minutes: number;
  order_index: number;
  is_published: boolean;
  course_id: string;
  created_at: string;
  updated_at: string;
  course: {
    title: string;
    slug: string;
  };
}

interface StudentProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  progress_percentage: number;
  last_accessed: string;
  completion_date?: string;
}

const FormacaoModuloDetalhes = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [module, setModule] = useState<ModuleData | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const isFormacao = getUserRoleName(profile) === 'formacao';

  useEffect(() => {
    if (!moduleId) return;
    loadModuleData();
  }, [moduleId]);

  const loadModuleData = async () => {
    try {
      setLoading(true);

      // Carregar dados do módulo
      const { data: moduleData, error: moduleError } = await supabase
        .from('formacao_modules')
        .select(`
          *,
          course:formacao_courses(title, slug)
        `)
        .eq('id', moduleId)
        .single();

      if (moduleError) throw moduleError;

      setModule(moduleData);

      // Carregar progresso do usuário se for estudante
      if (user && !isFormacao) {
        const { data: progressData } = await supabase
          .from('formacao_student_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .single();

        setProgress(progressData);
      }

    } catch (error) {
      console.error('Erro ao carregar módulo:', error);
      toast.error('Erro ao carregar dados do módulo');
    } finally {
      setLoading(false);
    }
  };

  const handleStartModule = async () => {
    if (!user || !module) return;

    try {
      setUpdating(true);

      // Criar ou atualizar progresso
      const { error } = await supabase
        .from('formacao_student_progress')
        .upsert({
          user_id: user.id,
          module_id: module.id,
          course_id: module.course_id,
          progress_percentage: 0,
          last_accessed: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Módulo iniciado!');
      loadModuleData();

    } catch (error) {
      console.error('Erro ao iniciar módulo:', error);
      toast.error('Erro ao iniciar módulo');
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteModule = async () => {
    if (!user || !module) return;

    try {
      setUpdating(true);

      const { error } = await supabase
        .from('formacao_student_progress')
        .upsert({
          user_id: user.id,
          module_id: module.id,
          course_id: module.course_id,
          completed: true,
          progress_percentage: 100,
          completion_date: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Módulo concluído!');
      loadModuleData();

    } catch (error) {
      console.error('Erro ao concluir módulo:', error);
      toast.error('Erro ao concluir módulo');
    } finally {
      setUpdating(false);
    }
  };

  const renderModuleContent = () => {
    if (!module?.content) return null;

    const content = module.content;

    return (
      <div className="space-y-6">
        {content.video_url && (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={content.video_url}
              className="w-full h-full"
              allowFullScreen
              title={module.title}
            />
          </div>
        )}

        {content.description && (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content.description }} />
          </div>
        )}

        {content.materials && content.materials.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Materiais de Apoio
            </h3>
            <div className="grid gap-3">
              {content.materials.map((material: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{material.title}</p>
                          <p className="text-sm text-muted-foreground">{material.type}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={material.url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Módulo não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O módulo solicitado não foi encontrado ou você não tem permissão para acessá-lo.
            </p>
            <Button onClick={() => navigate('/formacao')}>
              Voltar para Formação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/formacao/cursos/${module.course.slug}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para {module.course.title}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{module.title}</CardTitle>
                  <p className="text-muted-foreground">{module.description}</p>
                </div>
                {progress?.completed && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="info">Informações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="mt-6">
                  {renderModuleContent()}
                </TabsContent>
                
                <TabsContent value="info" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {module.duration_minutes} minutos
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Módulo {module.order_index}
                        </span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Sobre este módulo</h4>
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progresso */}
          {!isFormacao && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seu Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progress ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Progresso</span>
                        <span className="text-sm font-medium">
                          {progress.progress_percentage}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress.progress_percentage}%` }}
                        />
                      </div>

                      {progress.completed ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Módulo concluído!</span>
                        </div>
                      ) : (
                        <Button
                          onClick={handleCompleteModule}
                          disabled={updating}
                          className="w-full"
                        >
                          {updating ? 'Salvando...' : 'Marcar como Concluído'}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={handleStartModule}
                      disabled={updating}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {updating ? 'Iniciando...' : 'Iniciar Módulo'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações do Curso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{module.course.title}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{module.duration_minutes} minutos</span>
                </div>

                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Módulo {module.order_index}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormacaoModuloDetalhes;
