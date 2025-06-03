
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronLeft, ChevronRight, Play, BookOpen, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TrailTypingText } from "../onboarding/TrailTypingText";
import { ImplementationTrail } from "@/types/implementation-trail";
import { supabase } from "@/lib/supabase";

interface PremiumTrailExperienceProps {
  trail: ImplementationTrail;
  onEnhance?: () => void;
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
  solutionId: string;
}

interface EnrichedLesson {
  id: string;
  title: string;
  description?: string;
  moduleTitle?: string;
  courseTitle?: string;
  justification: string;
  priority: number;
}

export const PremiumTrailExperience: React.FC<PremiumTrailExperienceProps> = ({ 
  trail, 
  onEnhance 
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentType, setCurrentType] = useState<'solution' | 'lesson'>('solution');
  const [typingFinished, setTypingFinished] = useState(false);
  const [solutions, setSolutions] = useState<EnrichedSolution[]>([]);
  const [lessons, setLessons] = useState<EnrichedLesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados das soluções e aulas
  useEffect(() => {
    const loadTrailData = async () => {
      try {
        setLoading(true);

        // Carregar soluções
        const allSolutionIds = [
          ...trail.priority1.map(s => s.solutionId),
          ...trail.priority2.map(s => s.solutionId),
          ...trail.priority3.map(s => s.solutionId)
        ];

        if (allSolutionIds.length > 0) {
          const { data: solutionsData } = await supabase
            .from('solutions')
            .select('*')
            .in('id', allSolutionIds)
            .eq('published', true);

          const enrichedSolutions: EnrichedSolution[] = [];

          // Priority 1
          trail.priority1.forEach(item => {
            const solution = solutionsData?.find(s => s.id === item.solutionId);
            if (solution) {
              enrichedSolutions.push({
                ...solution,
                priority: 1,
                justification: item.justification || 'Prioridade alta para seu negócio',
                solutionId: item.solutionId
              });
            }
          });

          // Priority 2
          trail.priority2.forEach(item => {
            const solution = solutionsData?.find(s => s.id === item.solutionId);
            if (solution) {
              enrichedSolutions.push({
                ...solution,
                priority: 2,
                justification: item.justification || 'Prioridade média para seu negócio',
                solutionId: item.solutionId
              });
            }
          });

          // Priority 3
          trail.priority3.forEach(item => {
            const solution = solutionsData?.find(s => s.id === item.solutionId);
            if (solution) {
              enrichedSolutions.push({
                ...solution,
                priority: 3,
                justification: item.justification || 'Solução complementar',
                solutionId: item.solutionId
              });
            }
          });

          setSolutions(enrichedSolutions);
        }

        // Carregar aulas recomendadas
        if (trail.recommended_lessons && trail.recommended_lessons.length > 0) {
          const lessonIds = trail.recommended_lessons.map(l => l.lessonId);
          
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select(`
              *,
              learning_modules(
                id,
                title,
                learning_courses(
                  id,
                  title
                )
              )
            `)
            .in('id', lessonIds)
            .eq('published', true);

          const enrichedLessons: EnrichedLesson[] = trail.recommended_lessons.map(item => {
            const lesson = lessonsData?.find(l => l.id === item.lessonId);
            return {
              id: item.lessonId,
              title: item.title || lesson?.title || 'Aula recomendada',
              description: lesson?.description,
              moduleTitle: item.moduleTitle || lesson?.learning_modules?.title,
              courseTitle: item.courseTitle || lesson?.learning_modules?.learning_courses?.title,
              justification: item.justification || 'Aula recomendada para sua trilha',
              priority: item.priority || 1
            };
          });

          setLessons(enrichedLessons);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da trilha:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrailData();
  }, [trail]);

  const allItems = [
    ...solutions.map(s => ({ ...s, type: 'solution' as const })),
    ...lessons.map(l => ({ ...l, type: 'lesson' as const }))
  ].sort((a, b) => a.priority - b.priority);

  const currentItem = allItems[currentStep];

  const handleNext = () => {
    if (currentStep < allItems.length - 1 && typingFinished) {
      setCurrentStep(currentStep + 1);
      setTypingFinished(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTypingFinished(false);
    }
  };

  const handleItemClick = (item: any) => {
    if (item.type === 'solution') {
      navigate(`/solution/${item.id}`);
    } else {
      navigate(`/learning/lesson/${item.id}`);
    }
  };

  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 1:
        return {
          label: "Alta Prioridade",
          color: "from-emerald-500 to-teal-500",
          bgColor: "bg-emerald-500/10",
          textColor: "text-emerald-400",
          icon: Zap
        };
      case 2:
        return {
          label: "Prioridade Média",
          color: "from-amber-500 to-orange-500",
          bgColor: "bg-amber-500/10",
          textColor: "text-amber-400",
          icon: Sparkles
        };
      case 3:
        return {
          label: "Complementar",
          color: "from-blue-500 to-purple-500",
          bgColor: "bg-blue-500/10",
          textColor: "text-blue-400",
          icon: Play
        };
      default:
        return {
          label: "Recomendado",
          color: "from-viverblue to-cyan-500",
          bgColor: "bg-viverblue/10",
          textColor: "text-viverblue",
          icon: BookOpen
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-viverblue/30 border-t-viverblue rounded-full"
        />
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Trilha vazia</h3>
        <p className="text-neutral-400 mb-6">Não há itens na sua trilha personalizada.</p>
        <Button onClick={onEnhance} className="bg-viverblue hover:bg-viverblue/90">
          <Sparkles className="w-4 h-4 mr-2" />
          Regenerar Trilha
        </Button>
      </div>
    );
  }

  const priorityInfo = getPriorityInfo(currentItem.priority);
  const Icon = priorityInfo.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-viverblue via-emerald-400 to-viverblue bg-clip-text text-transparent mb-2">
          Sua Trilha Personalizada VIVER DE IA
        </h2>
        <p className="text-neutral-400">
          {currentStep + 1} de {allItems.length} • {currentItem.type === 'solution' ? 'Solução' : 'Aula'}
        </p>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentItem.type}-${currentStep}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Priority Badge */}
          <div className="flex justify-center">
            <Badge className={`bg-gradient-to-r ${priorityInfo.color} text-white px-4 py-2 text-sm font-medium`}>
              <Icon className="w-4 h-4 mr-2" />
              {priorityInfo.label}
            </Badge>
          </div>

          {/* Typing Text */}
          <Card className={`${priorityInfo.bgColor} border-2 border-transparent bg-gradient-to-r ${priorityInfo.color} p-0.5`}>
            <div className="bg-[#151823] rounded-lg p-6">
              <TrailTypingText
                key={`typing-${currentStep}`}
                text={currentItem.justification}
                onComplete={() => setTypingFinished(true)}
                typingSpeed={25}
              />
            </div>
          </Card>

          {/* Item Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className={`${priorityInfo.bgColor} border-2 border-transparent bg-gradient-to-r ${priorityInfo.color} p-0.5 cursor-pointer hover:scale-105 transition-transform duration-200`}
              onClick={() => handleItemClick(currentItem)}
            >
              <div className="bg-[#151823] rounded-lg p-6">
                <div className="flex items-start gap-4">
                  {/* Icon/Thumbnail */}
                  <div className={`w-16 h-16 rounded-lg ${priorityInfo.bgColor} flex items-center justify-center flex-shrink-0`}>
                    {currentItem.type === 'solution' && currentItem.thumbnail_url ? (
                      <img
                        src={currentItem.thumbnail_url}
                        alt={currentItem.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Icon className={`w-8 h-8 ${priorityInfo.textColor}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`${priorityInfo.textColor} border-current`}>
                        {currentItem.type === 'solution' ? 'Solução' : 'Aula'}
                      </Badge>
                      {currentItem.type === 'solution' && (
                        <Badge variant="outline" className="text-neutral-400 border-neutral-600">
                          {(currentItem as any).difficulty === 'easy' ? 'Fácil' : 
                           (currentItem as any).difficulty === 'medium' ? 'Médio' : 'Avançado'}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {currentItem.title}
                    </h3>

                    {currentItem.type === 'lesson' && (currentItem as any).courseTitle && (
                      <p className="text-sm text-neutral-400 mb-2">
                        Curso: {(currentItem as any).courseTitle}
                        {(currentItem as any).moduleTitle && ` • ${(currentItem as any).moduleTitle}`}
                      </p>
                    )}

                    <p className="text-neutral-300 line-clamp-3 mb-4">
                      {(currentItem as any).description || 'Clique para saber mais'}
                    </p>

                    <Button 
                      className={`bg-gradient-to-r ${priorityInfo.color} hover:opacity-90 text-white`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(currentItem);
                      }}
                    >
                      {currentItem.type === 'solution' ? 'Ver Solução' : 'Acessar Aula'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-neutral-800">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          variant="outline"
          className="border-neutral-700 hover:bg-neutral-800"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {allItems.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-viverblue' : 'bg-neutral-600'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentStep >= allItems.length - 1 || !typingFinished}
          className="bg-gradient-to-r from-viverblue to-emerald-500 hover:opacity-90"
        >
          Próxima
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Actions */}
      <div className="text-center pt-6 border-t border-neutral-800">
        <Button 
          onClick={onEnhance}
          variant="outline"
          className="border-viverblue text-viverblue hover:bg-viverblue/10"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Regenerar com IA
        </Button>
      </div>
    </div>
  );
};
