import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Clock, 
  Star, 
  GraduationCap,
  Brain,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  Target,
  Play
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Lesson {
  id: string;
  title: string;
  description: string;
  cover_image_url?: string;
  difficulty_level: string;
  estimated_time_minutes?: number;
  module_id: string;
}

interface LessonItem {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  justification: string;
  priority: number;
}

interface ImplementationTrail {
  priority1: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
  priority2: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
  priority3: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
  recommended_lessons?: LessonItem[];
  ai_message?: string;
  generated_at: string;
}

interface LessonsTabProps {
  trail: ImplementationTrail;
}

export const LessonsTab = ({ trail }: LessonsTabProps) => {
  const [lessons, setLessons] = useState<Record<string, Lesson>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Get all lesson IDs from trail
        const allLessonIds = (trail.recommended_lessons || []).map(item => item.lessonId).filter(Boolean);
        
        console.log('🎓 Carregando aulas para IDs:', allLessonIds);

        if (allLessonIds.length === 0) {
          console.log('⚠️ Nenhum ID de aula encontrado na trilha');
          setLessons({});
          setLoading(false);
          return;
        }

        // Fetch lessons from database
        const { data, error } = await supabase
          .from('learning_lessons')
          .select('id, title, description, cover_image_url, difficulty_level, estimated_time_minutes, module_id')
          .in('id', allLessonIds);

        if (error) {
          console.error('❌ Erro ao buscar aulas:', error);
          throw error;
        }

        console.log('✅ Aulas encontradas:', data?.length || 0, 'de', allLessonIds.length, 'solicitadas');

        // Se não encontramos nenhuma aula com os IDs da trilha, buscar aulas atuais do banco
        if (!data || data.length === 0) {
          console.log('⚠️ Nenhuma aula encontrada com os IDs da trilha. Buscando aulas atuais...');
          
          const { data: currentLessons, error: currentError } = await supabase
            .from('learning_lessons')
            .select('id, title, description, cover_image_url, difficulty_level, estimated_time_minutes, module_id')
            .eq('published', true)
            .order('order_index')
            .limit(5);

          if (currentError) {
            console.error('❌ Erro ao buscar aulas atuais:', currentError);
            throw currentError;
          }

          console.log('✅ Usando aulas atuais:', currentLessons?.length || 0);
          
          // Mapear as aulas atuais para os slots da trilha
          const lessonsMap: Record<string, Lesson> = {};
          
          if (currentLessons && currentLessons.length > 0) {
            // Mapear aulas atuais para os IDs da trilha
            allLessonIds.forEach((originalId, index) => {
              if (currentLessons[index]) {
                lessonsMap[originalId] = currentLessons[index];
              }
            });
          }
          
          setLessons(lessonsMap);
          setLoading(false);
          return;
        }

        // Create a mapping of lesson ID to lesson data
        const lessonsMap: Record<string, Lesson> = {};
        data?.forEach(lesson => {
          lessonsMap[lesson.id] = lesson;
        });

        setLessons(lessonsMap);

      } catch (error) {
        console.error('❌ Erro ao carregar aulas:', error);
        
        // Em caso de erro, criar aulas mock para demonstração
        const mockLessons: Record<string, Lesson> = {};
        const allLessonIds = (trail.recommended_lessons || []).map(item => item.lessonId).filter(Boolean);

        allLessonIds.forEach((id, index) => {
          mockLessons[id] = {
            id,
            title: `Aula ${index + 1}`,
            description: 'Esta é uma aula de demonstração com dados mock.',
            difficulty_level: index % 3 === 0 ? 'iniciante' : index % 3 === 1 ? 'intermediário' : 'avançado',
            estimated_time_minutes: 30 + (index * 15),
            module_id: `module-${index + 1}`,
            cover_image_url: undefined
          };
        });

        setLessons(mockLessons);
      } finally {
        setLoading(false);
      }
    };

    if (trail && trail.recommended_lessons) {
      setLoading(true);
      fetchLessons();
    } else {
      setLoading(false);
    }
  }, [trail]);

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return { label: 'Fundamentos', color: 'bg-operational', textColor: 'text-white' };
      case 2: return { label: 'Intermediário', color: 'bg-viverblue', textColor: 'text-white' };
      case 3: return { label: 'Avançado', color: 'bg-revenue', textColor: 'text-white' };
      default: return { label: 'Recomendada', color: 'bg-muted', textColor: 'text-muted-foreground' };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'iniciante': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediário': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'avançado': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted/50 text-muted-foreground border-muted/20';
    }
  };

  const LessonCard: React.FC<{ item: LessonItem }> = ({ item }) => {
    const lesson = lessons[item.lessonId];
    const priorityInfo = getPriorityLabel(item.priority);

    if (!lesson) {
      return (
        <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-card to-muted/30 backdrop-blur-sm animate-pulse">
          <div className="p-4 space-y-3">
            <div className="w-full h-32 bg-muted/50 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="group relative overflow-hidden border border-border/50 hover:border-operational/50 bg-gradient-to-br from-card/95 to-muted/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-operational/5 cursor-pointer">
        {/* Subtle hover effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-operational/5 via-transparent to-viverblue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 p-4 space-y-4" onClick={() => navigate(`/learning/lesson/${lesson.id}`)}>
          {/* Lesson Cover - Proporção mais balanceada (4:3) */}
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/50">
            {lesson.cover_image_url ? (
              <div className="relative w-full h-full">
                <img 
                  src={lesson.cover_image_url} 
                  alt={lesson.title}
                  className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.fallback-content') as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                
                {/* Fallback content */}
                <div className="fallback-content absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-operational/20 to-viverblue/20">
                  <div className="text-center">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 text-operational" />
                    <p className="text-sm text-muted-foreground font-medium">Aula IA</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-operational/20 to-viverblue/20 relative rounded-lg">
                {/* Background pattern */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-operational/20 rounded-full blur-xl animate-pulse" />
                  <div className="absolute top-1/4 right-1/4 w-10 h-10 bg-viverblue/15 rounded-full blur-lg animate-pulse animation-delay-1000" />
                </div>
                
                <div className="text-center relative z-10">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 text-operational group-hover:scale-110 transition-all duration-300" />
                  <p className="text-sm text-muted-foreground font-medium">Aula IA</p>
                </div>
              </div>
            )}
            
            {/* Priority badge */}
            <div className="absolute top-2 left-2">
              <Badge className={`${priorityInfo.color} ${priorityInfo.textColor} text-xs shadow-md backdrop-blur-sm group-hover:scale-105 transition-transform duration-200 border border-white/20 px-2 py-1`}>
                {priorityInfo.label}
              </Badge>
            </div>
            
            {/* Duration badge */}
            {lesson.estimated_time_minutes && (
              <div className="absolute bottom-2 right-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white">
                  <Clock className="h-3 w-3" />
                  <span>{lesson.estimated_time_minutes}min</span>
                </div>
              </div>
            )}
            
            {/* Difficulty */}
            <div className="absolute top-2 right-2">
              <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${getDifficultyColor(lesson.difficulty_level)}`}>
                {lesson.difficulty_level || 'beginner'}
              </div>
            </div>

            {/* Play overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                <Play className="h-5 w-5 text-operational fill-operational" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-base leading-snug text-foreground group-hover:text-operational transition-colors duration-200 line-clamp-2">
              {lesson.title}
            </h3>
            
            {/* Description */}
            {lesson.description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {lesson.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span>Módulo: {lesson.module_id.slice(0, 8)}...</span>
            </div>

            {/* Justification */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-operational/5 to-viverblue/5 border border-operational/10">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-operational flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-medium text-operational mb-1">Por que esta aula?</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {item.justification}
                  </p>
                </div>
              </div>
            </div>

            {/* Action button */}
            <Button 
              variant="outline" 
              size="sm"
              className="w-full group-hover:bg-operational group-hover:text-white group-hover:border-operational transition-all duration-200 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/learning/lesson/${lesson.id}`);
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Começar Aula
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const recommendedLessons = trail.recommended_lessons || [];

  if (recommendedLessons.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-operational/20 to-operational/10 rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8 text-operational" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Aulas em preparação</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            As recomendações de aulas personalizadas estão sendo preparadas para complementar suas soluções prioritárias.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-4">
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
            <div className="grid gap-4">
              {[1, 2].map((item) => (
                <Card key={item} className="aurora-glass border-muted/30 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Group lessons by priority for better organization
  const groupedLessons = recommendedLessons.reduce((acc, lesson) => {
    if (!acc[lesson.priority]) {
      acc[lesson.priority] = [];
    }
    acc[lesson.priority].push(lesson);
    return acc;
  }, {} as Record<number, LessonItem[]>);

  return (
    <div className="space-y-8">
      {/* Aurora Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-operational/10 via-viverblue/5 to-revenue/10 border border-operational/20 p-8">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-operational/5 via-transparent to-viverblue/5 opacity-50" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-operational/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-viverblue/10 rounded-full blur-2xl animate-pulse animation-delay-2000" />
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-operational/20 rounded-xl">
              <GraduationCap className="h-8 w-8 text-operational" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-operational via-viverblue to-revenue bg-clip-text text-transparent">
              Aulas Recomendadas por IA
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Jornada de aprendizado personalizada para acelerar sua implementação de IA
          </p>
        </div>
      </div>

      {/* Render lessons grouped by priority */}
      {Object.entries(groupedLessons)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([priority, priorityLessons]) => {
          const priorityInfo = getPriorityLabel(Number(priority));
          const priorityColors = {
            1: { border: 'border-operational/20', bg: 'bg-operational', shadow: 'shadow-operational/25' },
            2: { border: 'border-viverblue/20', bg: 'bg-viverblue', shadow: 'shadow-viverblue/25' },
            3: { border: 'border-revenue/20', bg: 'bg-revenue', shadow: 'shadow-revenue/25' }
          };
          const colors = priorityColors[Number(priority) as keyof typeof priorityColors] || priorityColors[1];
          
          return (
            <section key={priority} className="space-y-6">
              <div className={`flex items-center gap-4 pb-4 border-b ${colors.border}`}>
                <div className="relative">
                  <div className={`w-8 h-8 bg-gradient-to-br ${colors.bg} to-${colors.bg}/70 rounded-full flex items-center justify-center shadow-lg ${colors.shadow}`}>
                    <span className="text-white font-bold text-sm">{priority}</span>
                  </div>
                  <div className={`absolute inset-0 ${colors.bg} rounded-full animate-ping opacity-20`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground">{priorityInfo.label}</h3>
                  <p className="text-muted-foreground">
                    {priority === '1' ? 'Base essencial para sua jornada' : 
                     priority === '2' ? 'Expandir conhecimento e habilidades' : 
                     'Expertise avançada em IA'}
                  </p>
                </div>
                <Badge className={`${priorityInfo.color} text-white px-4 py-2 text-sm`}>
                  {priorityLessons.length} aulas
                </Badge>
              </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                 {priorityLessons
                   .sort((a, b) => a.priority - b.priority)
                   .map((item, index) => (
                     <div
                       key={`p${priority}-${index}`}
                       className="animate-fade-in"
                       style={{ animationDelay: `${index * 150}ms` }}
                     >
                       <LessonCard item={item} />
                     </div>
                   ))}
               </div>
            </section>
          );
        })}

      {/* Aurora Learning Guide */}
      <Card className="relative overflow-hidden border border-operational/30 bg-gradient-to-br from-operational/5 via-viverblue/5 to-revenue/5 backdrop-blur-sm">
        {/* Animated background patterns */}
        <div className="absolute inset-0 bg-gradient-to-r from-operational/10 via-transparent to-viverblue/10 opacity-30" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-operational/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-viverblue/20 rounded-full blur-xl animate-pulse animation-delay-2000" />
        
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-operational/20 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-operational" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground">Guia de Aprendizado Inteligente</CardTitle>
              <p className="text-muted-foreground mt-1">Estratégia de estudos recomendada pela IA</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-operational/5 to-transparent border border-operational/10">
              <div className="w-8 h-8 bg-operational/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-operational font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Sequência Progressiva</h4>
                <p className="text-sm text-muted-foreground">
                  Siga a ordem recomendada das aulas para construir conhecimento sólido e evitar lacunas de aprendizado.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-viverblue/5 to-transparent border border-viverblue/10">
              <div className="w-8 h-8 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-viverblue font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Prática Imediata</h4>
                <p className="text-sm text-muted-foreground">
                  Aplique os conceitos aprendidos imediatamente nas soluções recomendadas para fixar o conhecimento.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-revenue/5 to-transparent border border-revenue/10">
              <div className="w-8 h-8 bg-revenue/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-revenue font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Conexão Estratégica</h4>
                <p className="text-sm text-muted-foreground">
                  Cada aula foi selecionada para complementar suas soluções prioritárias e acelerar a implementação.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};