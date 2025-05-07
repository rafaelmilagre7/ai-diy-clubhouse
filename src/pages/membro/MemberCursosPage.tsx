
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Video, Book, Clock } from 'lucide-react';

const MemberCursosPage: React.FC = () => {
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true);
        
        // Buscar todos os cursos publicados
        const { data: cursosData, error } = await supabase
          .from('learning_courses')
          .select(`
            id,
            title,
            description,
            cover_image_url,
            published,
            created_at
          `)
          .eq('published', true)
          .order('order_index', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (!cursosData || cursosData.length === 0) {
          setCursos([]);
          return;
        }
        
        // Para cada curso, buscar os módulos
        const cursosComDetalhes = await Promise.all(
          cursosData.map(async (curso) => {
            // Buscar os módulos do curso
            const { data: modulos } = await supabase
              .from('learning_modules')
              .select('id')
              .eq('course_id', curso.id)
              .eq('published', true);
            
            // Contar total de aulas do curso
            const moduloIds = modulos?.map(m => m.id) || [];
            let totalAulas = 0;
            let aulasAssistidas = 0;
            
            if (moduloIds.length > 0) {
              // Buscar todas as aulas publicadas dos módulos
              const { data: aulas, error: aulasError } = await supabase
                .from('learning_lessons')
                .select('id')
                .in('module_id', moduloIds)
                .eq('published', true);
              
              totalAulas = aulas?.length || 0;
              
              // Se tiver usuário, buscar progresso
              if (user && totalAulas > 0) {
                const aulasIds = aulas?.map(a => a.id) || [];
                
                if (aulasIds.length > 0) {
                  const { data: progresso } = await supabase
                    .from('learning_progress')
                    .select('lesson_id, progress_percentage')
                    .eq('user_id', user.id)
                    .in('lesson_id', aulasIds)
                    .gt('progress_percentage', 95); // Considerar aulas com mais de 95% como assistidas
                  
                  aulasAssistidas = progresso?.length || 0;
                }
              }
            }
            
            return {
              ...curso,
              totalModulos: moduloIds.length,
              totalAulas,
              aulasAssistidas,
              progressoPercentual: totalAulas > 0 ? Math.round((aulasAssistidas / totalAulas) * 100) : 0
            };
          })
        );
        
        setCursos(cursosComDetalhes);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCursos();
  }, [user]);
  
  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Meus Cursos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Meus Cursos</h1>
      
      {cursos.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Nenhum curso disponível</h2>
          <p className="text-muted-foreground">
            No momento não há cursos disponíveis para você.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <Link to={`/membro/curso/${curso.id}`} key={curso.id} className="block">
              <Card className="overflow-hidden border h-full hover:shadow-md transition-all">
                {curso.cover_image_url ? (
                  <div className="h-40 bg-muted overflow-hidden">
                    <img 
                      src={curso.cover_image_url} 
                      alt={curso.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                    <Book className="h-12 w-12 text-primary/50" />
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <CardTitle>{curso.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {curso.description || "Sem descrição disponível."}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span>{curso.totalAulas} aulas</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{curso.totalModulos} módulos</span>
                    </div>
                  </div>
                  
                  {user && (
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{curso.progressoPercentual}%</span>
                      </div>
                      <Progress value={curso.progressoPercentual} />
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-0">
                  <div className="flex justify-between w-full">
                    <Badge variant={curso.progressoPercentual === 100 ? "success" : "outline"}>
                      {curso.progressoPercentual === 100 
                        ? 'Concluído' 
                        : curso.progressoPercentual > 0 
                          ? 'Em andamento' 
                          : 'Não iniciado'
                      }
                    </Badge>
                    
                    <Badge variant="secondary">
                      {curso.aulasAssistidas}/{curso.totalAulas} aulas
                    </Badge>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberCursosPage;
