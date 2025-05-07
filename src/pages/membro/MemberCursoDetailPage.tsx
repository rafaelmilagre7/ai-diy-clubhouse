
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Circle, ChevronDown, ChevronUp, Video, FileText, BookOpen, Book } from 'lucide-react';
import { toast } from 'sonner';

const MemberCursoDetailPage: React.FC = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [curso, setCurso] = useState<any>(null);
  const [modulos, setModulos] = useState<any[]>([]);
  const [expandedModulos, setExpandedModulos] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const fetchCursoDetalhes = async () => {
      try {
        setLoading(true);
        
        // Buscar detalhes do curso
        const { data: cursoData, error: cursoError } = await supabase
          .from('learning_courses')
          .select('*')
          .eq('id', cursoId)
          .eq('published', true)
          .single();
        
        if (cursoError || !cursoData) {
          toast.error('Curso não encontrado ou não publicado');
          setLoading(false);
          return;
        }
        
        setCurso(cursoData);
        
        // Buscar módulos do curso
        const { data: modulosData, error: modulosError } = await supabase
          .from('learning_modules')
          .select('*')
          .eq('course_id', cursoId)
          .eq('published', true)
          .order('order_index', { ascending: true });
        
        if (modulosError) {
          throw modulosError;
        }
        
        // Para cada módulo, buscar suas aulas
        const modulosComAulas = await Promise.all(
          (modulosData || []).map(async (modulo) => {
            const { data: aulas, error: aulasError } = await supabase
              .from('learning_lessons')
              .select(`
                id,
                title,
                description,
                estimated_time_minutes,
                published,
                order_index,
                cover_image_url
              `)
              .eq('module_id', modulo.id)
              .eq('published', true)
              .order('order_index', { ascending: true });
            
            if (aulasError) {
              throw aulasError;
            }
            
            // Se usuário estiver logado, buscar progresso para cada aula
            if (user) {
              const aulasIds = aulas?.map(aula => aula.id) || [];
              
              if (aulasIds.length > 0) {
                const { data: progressos } = await supabase
                  .from('learning_progress')
                  .select('*')
                  .eq('user_id', user.id)
                  .in('lesson_id', aulasIds);
                
                // Mapear progresso para aulas
                const aulasComProgresso = aulas?.map(aula => {
                  const progresso = progressos?.find(p => p.lesson_id === aula.id);
                  return {
                    ...aula,
                    progresso: progresso ? progresso.progress_percentage : 0,
                    concluida: progresso ? progresso.progress_percentage >= 95 : false
                  };
                });
                
                return {
                  ...modulo,
                  aulas: aulasComProgresso || [],
                  totalAulas: aulas?.length || 0,
                  aulasCompletadas: aulasComProgresso?.filter(a => a.concluida)?.length || 0
                };
              }
            }
            
            return {
              ...modulo,
              aulas: aulas || [],
              totalAulas: aulas?.length || 0,
              aulasCompletadas: 0
            };
          })
        );
        
        // Expandir primeiro módulo por padrão
        if (modulosComAulas.length > 0) {
          setExpandedModulos({ [modulosComAulas[0].id]: true });
        }
        
        setModulos(modulosComAulas);
      } catch (error) {
        console.error('Erro ao carregar detalhes do curso:', error);
        toast.error('Erro ao carregar dados do curso');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCursoDetalhes();
  }, [cursoId, user]);
  
  const toggleModulo = (moduloId: string) => {
    setExpandedModulos(prev => ({
      ...prev,
      [moduloId]: !prev[moduloId]
    }));
  };
  
  const calcularProgressoCurso = () => {
    const totalAulas = modulos.reduce((acc, modulo) => acc + modulo.totalAulas, 0);
    const aulasCompletadas = modulos.reduce((acc, modulo) => acc + modulo.aulasCompletadas, 0);
    
    return totalAulas > 0 ? Math.round((aulasCompletadas / totalAulas) * 100) : 0;
  };
  
  if (loading) {
    return (
      <div className="container max-w-5xl py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  if (!curso) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Curso não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O curso que você está procurando não existe ou não está disponível.
          </p>
          <Button asChild>
            <Link to="/membro/cursos">Ver todos os cursos</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{curso.title}</h1>
            <p className="text-muted-foreground mt-2">{curso.description || "Sem descrição disponível."}</p>
          </div>
          
          <Button asChild>
            <Link to="/membro/cursos">Ver todos os cursos</Link>
          </Button>
        </div>
        
        {user && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do curso</span>
              <span>{calcularProgressoCurso()}%</span>
            </div>
            <Progress value={calcularProgressoCurso()} />
          </div>
        )}
      </div>
      
      <Separator />
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Conteúdo do curso</h2>
        
        {modulos.length === 0 ? (
          <div className="text-center py-8 bg-muted/20 rounded-md">
            <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground">Este curso ainda não possui módulos disponíveis.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modulos.map((modulo) => (
              <Card key={modulo.id} className="overflow-hidden">
                <CardHeader 
                  className="bg-muted/10 py-4 cursor-pointer"
                  onClick={() => toggleModulo(modulo.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg flex items-center">
                        {expandedModulos[modulo.id] ? (
                          <ChevronUp className="h-5 w-5 mr-2 inline text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 mr-2 inline text-muted-foreground" />
                        )}
                        {modulo.title}
                      </CardTitle>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">
                        {modulo.aulasCompletadas}/{modulo.totalAulas} aulas
                      </Badge>
                      
                      {modulo.totalAulas > 0 && modulo.aulasCompletadas === modulo.totalAulas && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {expandedModulos[modulo.id] && (
                  <CardContent className="pt-4 pb-2">
                    {modulo.description && (
                      <p className="text-sm text-muted-foreground mb-4">{modulo.description}</p>
                    )}
                    
                    {modulo.aulas.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground">Este módulo ainda não possui aulas.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {modulo.aulas.map((aula: any) => (
                          <Link to={`/membro/aula/${aula.id}`} key={aula.id}>
                            <div 
                              className="flex items-start p-3 rounded-md hover:bg-muted/30 transition-colors cursor-pointer"
                            >
                              {aula.concluida ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                              )}
                              
                              <div className="flex-grow">
                                <h4 className="font-medium text-base">{aula.title}</h4>
                                
                                {aula.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {aula.description}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-3">
                                <Video className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberCursoDetailPage;
