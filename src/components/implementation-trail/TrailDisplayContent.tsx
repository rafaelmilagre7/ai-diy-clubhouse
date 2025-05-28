
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, ChevronRight, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImplementationTrail } from "@/types/implementation-trail";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface TrailDisplayContentProps {
  trail: ImplementationTrail;
  onRegenerate: () => void;
}

interface EnrichedSolution {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  thumbnail_url?: string;
  priority: number;
  justification: string;
}

interface EnrichedLesson {
  id: string;
  title: string;
  description?: string;
  difficulty_level: string;
  estimated_time_minutes?: number;
  moduleTitle?: string;
  courseTitle?: string;
  justification: string;
}

export const TrailDisplayContent: React.FC<TrailDisplayContentProps> = ({
  trail,
  onRegenerate
}) => {
  const navigate = useNavigate();
  const [solutions, setSolutions] = useState<EnrichedSolution[]>([]);
  const [lessons, setLessons] = useState<EnrichedLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrailData = async () => {
      try {
        setLoading(true);

        // Buscar soluções
        const solutionIds = [
          ...trail.priority1.map(s => s.solutionId),
          ...trail.priority2.map(s => s.solutionId),
          ...trail.priority3.map(s => s.solutionId)
        ];

        if (solutionIds.length > 0) {
          const { data: solutionsData } = await supabase
            .from('solutions')
            .select('*')
            .in('id', solutionIds)
            .eq('published', true);

          if (solutionsData) {
            const enrichedSolutions: EnrichedSolution[] = [];

            // Mapear prioridades
            ['priority1', 'priority2', 'priority3'].forEach((priority, idx) => {
              const items = (trail as any)[priority] || [];
              items.forEach((item: any) => {
                const solution = solutionsData.find(s => s.id === item.solutionId);
                if (solution) {
                  enrichedSolutions.push({
                    ...solution,
                    priority: idx + 1,
                    justification: item.justification || 'Recomendação personalizada para seu perfil'
                  });
                }
              });
            });

            setSolutions(enrichedSolutions);
          }
        }

        // Buscar aulas recomendadas
        if (trail.recommended_lessons && trail.recommended_lessons.length > 0) {
          const lessonIds = trail.recommended_lessons.map(l => l.lessonId);
          
          const { data: lessonsData } = await supabase
            .from('learning_lessons')
            .select(`
              *,
              learning_modules(
                title,
                learning_courses(title)
              )
            `)
            .in('id', lessonIds)
            .eq('published', true);

          if (lessonsData) {
            const enrichedLessons: EnrichedLesson[] = lessonsData.map(lesson => {
              const recommendation = trail.recommended_lessons?.find(r => r.lessonId === lesson.id);
              return {
                ...lesson,
                moduleTitle: lesson.learning_modules?.title,
                courseTitle: lesson.learning_modules?.learning_courses?.title,
                justification: recommendation?.justification || 'Aula recomendada para complementar sua trilha'
              };
            });

            setLessons(enrichedLessons);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados da trilha:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailData();
  }, [trail]);

  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 1:
        return {
          label: "Alta Prioridade",
          color: "bg-viverblue text-white",
          description: "Implementar primeiro"
        };
      case 2:
        return {
          label: "Prioridade Média", 
          color: "bg-amber-500 text-white",
          description: "Implementar em seguida"
        };
      case 3:
        return {
          label: "Complementar",
          color: "bg-neutral-500 text-white", 
          description: "Implementar por último"
        };
      default:
        return {
          label: "Padrão",
          color: "bg-neutral-600 text-white",
          description: "Solução adicional"
        };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
      case 'beginner':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium':
      case 'intermediate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mr-3"></div>
        <span className="text-neutral-300">Carregando sua trilha...</span>
      </div>
    );
  }

  // Agrupar soluções por prioridade
  const priority1 = solutions.filter(s => s.priority === 1);
  const priority2 = solutions.filter(s => s.priority === 2);
  const priority3 = solutions.filter(s => s.priority === 3);

  const renderSolutionGroup = (title: string, solutions: EnrichedSolution[], priority: number) => {
    if (solutions.length === 0) return null;

    const priorityInfo = getPriorityInfo(priority);

    return (
      <motion.div
        key={title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: priority * 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Badge className={`${priorityInfo.color} px-3 py-1`}>
            {priorityInfo.label}
          </Badge>
          <span className="text-sm text-neutral-400">{priorityInfo.description}</span>
        </div>

        <div className="space-y-3">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (priority * 0.1) + (index * 0.05) }}
            >
              <Card 
                className="bg-[#151823]/80 border-neutral-700/50 hover:border-viverblue/50 transition-all cursor-pointer group"
                onClick={() => navigate(`/solution/${solution.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {solution.thumbnail_url ? (
                      <img
                        src={solution.thumbnail_url}
                        alt={solution.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-viverblue/20 flex items-center justify-center">
                        <span className="text-viverblue font-bold text-lg">
                          {solution.title.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white group-hover:text-viverblue transition-colors">
                          {solution.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(solution.difficulty)}`}
                        >
                          {solution.difficulty === 'easy' && 'Fácil'}
                          {solution.difficulty === 'medium' && 'Médio'}
                          {solution.difficulty === 'advanced' && 'Avançado'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-neutral-300 line-clamp-1 mb-2">
                        {solution.description}
                      </p>
                      
                      <p className="text-xs text-viverblue font-medium">
                        {solution.justification}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-viverblue transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-viverblue mb-2">
            Sua Trilha Personalizada
          </h2>
          <p className="text-neutral-400">
            Recomendações personalizadas baseadas no seu perfil e objetivos
          </p>
        </div>
        
        <Button
          onClick={onRegenerate}
          variant="outline"
          size="sm"
          className="border-viverblue/30 text-viverblue hover:bg-viverblue/10"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerar
        </Button>
      </motion.div>

      {/* Soluções */}
      {solutions.length > 0 && (
        <Card className="bg-[#151823]/60 border-neutral-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-viverblue">
              <Target className="h-5 w-5" />
              Soluções Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderSolutionGroup("Alta Prioridade", priority1, 1)}
            {renderSolutionGroup("Prioridade Média", priority2, 2)}
            {renderSolutionGroup("Complementar", priority3, 3)}
          </CardContent>
        </Card>
      )}

      {/* Aulas Recomendadas */}
      {lessons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-[#151823]/60 border-neutral-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-viverblue">
                <Sparkles className="h-5 w-5" />
                Aulas Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.05) }}
                  >
                    <Card 
                      className="bg-[#151823]/80 border-neutral-700/50 hover:border-viverblue/50 transition-all cursor-pointer group"
                      onClick={() => navigate(`/learning/lesson/${lesson.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-viverblue/20 to-viverblue/10 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-viverblue" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white group-hover:text-viverblue transition-colors">
                                {lesson.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getDifficultyColor(lesson.difficulty_level)}`}
                              >
                                {lesson.difficulty_level}
                              </Badge>
                              {lesson.estimated_time_minutes && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.estimated_time_minutes}min
                                </Badge>
                              )}
                            </div>
                            
                            {lesson.moduleTitle && (
                              <p className="text-xs text-neutral-500 mb-1">
                                {lesson.courseTitle} • {lesson.moduleTitle}
                              </p>
                            )}
                            
                            <p className="text-xs text-viverblue font-medium">
                              {lesson.justification}
                            </p>
                          </div>

                          <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-viverblue transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Estado vazio */}
      {solutions.length === 0 && lessons.length === 0 && (
        <Card className="bg-[#151823]/60 border-neutral-700/50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Target className="h-16 w-16 text-neutral-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-4">
                Nenhuma recomendação encontrada
              </h3>
              <p className="text-neutral-400 mb-6">
                Não conseguimos encontrar soluções ou aulas que correspondam ao seu perfil.
              </p>
              <Button 
                onClick={onRegenerate}
                className="bg-viverblue hover:bg-viverblue/90"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
