
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, ArrowRight, Sparkles, TrendingUp, Eye, AlertCircle, ChevronUp, Brain, Clock, Play, Star, BookOpen, Target } from 'lucide-react';
import { EnhancedLessonCard } from '../cards/EnhancedLessonCard';
import { LessonImagesProvider, useLessonImages } from '../contexts/LessonImagesContext';
import { useTopLessons } from '../hooks/useTopLessons';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecommendedLesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  justification: string;
  priority: number;
}

interface AILesson {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  topics: string[];
  ai_score: number;
  reasoning: string;
}

interface LessonsTabProps {
  lessons: RecommendedLesson[];
}

const LessonsTabContent = ({ lessons }: LessonsTabProps) => {
  const [aiLessons, setAiLessons] = useState<AILesson[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();
  const { topLessons, hasMoreLessons, remainingCount, totalLessons, showAll, toggleShowAll } = useTopLessons(lessons, 5);
  const { preloadLessonImages, loading } = useLessonImages();

  const lessonIds = useMemo(() => 
    topLessons.map(lesson => lesson.lessonId), 
    [topLessons]
  );

  useEffect(() => {
    if (lessonIds.length > 0) {
      console.log('[LessonsTab] Precarregando imagens para aulas:', lessonIds);
      preloadLessonImages(lessonIds);
    }
  }, [lessonIds, preloadLessonImages]);

  useEffect(() => {
    fetchAIRecommendedLessons();
  }, []);

  const fetchAIRecommendedLessons = async () => {
    try {
      setAiLoading(true);
      
      const { data, error } = await supabase.functions.invoke('recommend-lessons-ai');
      
      if (error) {
        console.error('Erro ao buscar recomendações de aulas:', error);
        toast({
          title: "Erro ao carregar recomendações",
          description: "Não foi possível carregar as aulas recomendadas pela IA.",
          variant: "destructive",
        });
        return;
      }

      setAiLessons(data.lessons || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strategy':
        return 'bg-strategy/20 text-strategy border-strategy/30';
      case 'operational':
        return 'bg-operational/20 text-operational border-operational/30';
      case 'revenue':
        return 'bg-revenue/20 text-revenue border-revenue/30';
      default:
        return 'bg-viverblue/20 text-viverblue border-viverblue/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'advanced':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Iniciante';
      case 'medium':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return difficulty;
    }
  };

  // Se temos aulas da IA, mostrar interface da IA
  if (aiLessons.length > 0 || aiLoading) {
    if (aiLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-viverblue mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              IA analisando seu perfil...
            </h3>
            <p className="text-muted-foreground">
              Selecionando as melhores aulas para você
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-viverblue" />
            <h2 className="text-2xl font-bold text-foreground">
              Aulas Recomendadas para Você
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nossa IA analisou seu perfil e selecionou as aulas mais relevantes para seus objetivos e nível de experiência.
          </p>
        </div>

        {/* Lista de Aulas */}
        <div className="grid gap-6">
          {aiLessons.map((lesson, index) => (
            <Card key={lesson.id} className="aurora-glass aurora-hover-scale group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs font-medium bg-viverblue/10 border-viverblue/30">
                        #{index + 1} Recomendada
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-current" />
                        <span className="text-sm font-medium text-amber-400">
                          {lesson.ai_score}% compatível
                        </span>
                      </div>
                    </div>
                    
                    <CardTitle className="text-xl text-foreground group-hover:text-viverblue transition-colors">
                      {lesson.title}
                    </CardTitle>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="h-5 w-5" />
                  </Button>
                </div>

                {/* Tags e Metadados */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="outline" className={getCategoryColor(lesson.category)}>
                    {lesson.category === 'strategy' ? 'Estratégia' : 
                     lesson.category === 'operational' ? 'Operacional' : 
                     lesson.category === 'revenue' ? 'Revenue' : lesson.category}
                  </Badge>
                  
                  <Badge variant="outline" className={getDifficultyColor(lesson.difficulty)}>
                    {getDifficultyLabel(lesson.difficulty)}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-sm">{lesson.duration}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Descrição */}
                <p className="text-muted-foreground leading-relaxed">
                  {lesson.description}
                </p>

                {/* Por que é recomendada */}
                <div className="bg-viverblue/5 border border-viverblue/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-viverblue mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Por que é perfeita para você
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {lesson.reasoning}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tópicos */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Você vai aprender:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {lesson.topics.map((topic, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="text-xs bg-card border border-border"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Começar Aula
                  </Button>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {aiLessons.length === 0 && !aiLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma aula encontrada
            </h3>
            <p className="text-muted-foreground">
              Complete seu perfil para receber recomendações personalizadas.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Fallback para aulas antigas se não houver aulas da IA
  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-transparent rounded-2xl blur-xl opacity-50" />
          <Card className="glass-dark border border-neutral-700/50 relative backdrop-blur-sm max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold text-high-contrast mb-2">
                Nenhuma aula recomendada ainda
              </h3>
              <p className="text-medium-contrast mb-4">
                As aulas personalizadas estão sendo processadas. Tente regenerar sua trilha ou aguarde alguns instantes.
              </p>
              <Button 
                variant="outline" 
                className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                onClick={() => window.location.reload()}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Atualizar Página
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header da seção - melhorado */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-viverblue/20 via-green-500/10 to-transparent rounded-2xl blur-xl opacity-50" />
        <Card className="glass-dark border-2 border-viverblue/40 bg-viverblue/5 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-viverblue/20 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-viverblue animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-high-contrast text-3xl font-bold flex items-center gap-2">
                    🎓 {showAll ? 'Todas as Aulas' : 'Top 5 Aulas'} Recomendadas
                    <Sparkles className="h-6 w-6 text-viverblue animate-pulse" />
                  </CardTitle>
                  <p className="text-medium-contrast text-lg mt-2">
                    {showAll ? 
                      `Todas as ${topLessons.length} aulas recomendadas para você` :
                      `As ${topLessons.length} aulas mais relevantes selecionadas especialmente para você`
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-viverblue">{topLessons.length}</div>
                <div className="text-sm text-medium-contrast">
                  {showAll ? 'Total' : 'Top'} Aulas
                </div>
                {hasMoreLessons && !showAll && (
                  <div className="text-xs text-green-400 mt-1">
                    +{remainingCount} disponíveis
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: Math.min(showAll ? totalLessons : 5, topLessons.length) }, (_, i) => (
            <Card key={i} className="glass-dark border border-neutral-700/50 animate-pulse h-full">
              <CardContent className="p-0">
                <div className="aspect-[9/16] bg-neutral-800 rounded-t-xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-neutral-700 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-neutral-700 rounded"></div>
                    <div className="h-3 bg-neutral-700 rounded w-4/5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grid de aulas - formato 9:16 */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topLessons.map((lesson, index) => (
            <div
              key={`${lesson.lessonId}-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <EnhancedLessonCard lesson={lesson} index={index} />
            </div>
          ))}
        </div>
      )}

      {/* Botão para mostrar/ocultar mais aulas */}
      {hasMoreLessons && !loading && (
        <div className="animate-fade-in" style={{ animationDelay: '750ms' }}>
          <Card className="glass-dark border border-viverblue/30 bg-viverblue/5 hover:border-viverblue/50 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <TrendingUp className="h-6 w-6 text-viverblue" />
                <h3 className="text-xl font-semibold text-high-contrast">
                  {showAll ? 'Mostrar Apenas Top 5' : 'Mais Aulas Disponíveis'}
                </h3>
              </div>
              <p className="text-medium-contrast mb-4">
                {showAll ? 
                  'Voltar para a visualização das 5 aulas mais importantes' :
                  `Existem mais ${remainingCount} aulas recomendadas além das top 5 mostradas acima.`
                }
              </p>
              <Button 
                variant="outline" 
                className="border-viverblue/50 text-viverblue hover:bg-viverblue/10"
                onClick={toggleShowAll}
              >
                {showAll ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Mostrar Apenas Top 5
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Todas as {totalLessons} Aulas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export const LessonsTab = ({ lessons }: LessonsTabProps) => {
  return (
    <LessonImagesProvider>
      <LessonsTabContent lessons={lessons} />
    </LessonImagesProvider>
  );
};
