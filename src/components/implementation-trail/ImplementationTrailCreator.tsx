
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { TrailSolutionsList } from "./TrailSolutionsList";
import { TrailLessonsList } from "./TrailLessonsList";
import { supabase } from "@/lib/supabase";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

/**
 * Componente principal para exibir e gerenciar a trilha de implementação do usuário.
 */
export const ImplementationTrailCreator = () => {
  const { trail, isLoading, hasContent, regenerating, refreshing, error, refreshTrail, generateImplementationTrail } = useImplementationTrail();
  const { progress } = useProgress();
  const [solutions, setSolutions] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [activeTab, setActiveTab] = useState("soluções");

  // Carregar dados das soluções quando a trilha for carregada
  useEffect(() => {
    const fetchSolutionsForTrail = async () => {
      if (!trail) {
        setSolutions([]);
        setLoadingSolutions(false);
        return;
      }

      try {
        setLoadingSolutions(true);
        const solutionIds = [
          ...trail.priority1.map(r => r.solutionId),
          ...trail.priority2.map(r => r.solutionId),
          ...trail.priority3.map(r => r.solutionId)
        ].filter(Boolean); // Filtrar valores nulos/undefined

        if (solutionIds.length === 0) {
          setSolutions([]);
          setLoadingSolutions(false);
          return;
        }

        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .in("id", solutionIds);

        if (error) throw error;

        // Mapear soluções
        const mappedSolutions: any[] = [];

        trail.priority1.forEach(rec => {
          const solution = data?.find(s => s.id === rec.solutionId);
          if (solution) {
            mappedSolutions.push({
              ...solution,
              priority: 1,
              justification: rec.justification,
              solutionId: rec.solutionId
            });
          }
        });

        trail.priority2.forEach(rec => {
          const solution = data?.find(s => s.id === rec.solutionId);
          if (solution) {
            mappedSolutions.push({
              ...solution,
              priority: 2,
              justification: rec.justification,
              solutionId: rec.solutionId
            });
          }
        });

        trail.priority3.forEach(rec => {
          const solution = data?.find(s => s.id === rec.solutionId);
          if (solution) {
            mappedSolutions.push({
              ...solution,
              priority: 3,
              justification: rec.justification,
              solutionId: rec.solutionId
            });
          }
        });

        setSolutions(mappedSolutions);
      } catch (error) {
        console.error("Erro ao buscar soluções para a trilha:", error);
        toast.error("Erro ao carregar soluções recomendadas");
      } finally {
        setLoadingSolutions(false);
      }
    };

    fetchSolutionsForTrail();
  }, [trail]);

  // Buscar lições quando a trilha for carregada
  useEffect(() => {
    const fetchLessonsForTrail = async () => {
      if (!trail || !trail.recommended_lessons || trail.recommended_lessons.length === 0) {
        setLessons([]);
        setLoadingLessons(false);
        return;
      }

      try {
        setLoadingLessons(true);
        const lessonIds = trail.recommended_lessons.map(l => l.lessonId).filter(Boolean);

        if (lessonIds.length === 0) {
          setLessons([]);
          setLoadingLessons(false);
          return;
        }

        // Buscar dados das lições
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("learning_lessons")
          .select(`
            id,
            title,
            description,
            difficulty_level,
            estimated_time_minutes,
            cover_image_url,
            module_id,
            learning_modules (
              id,
              title,
              course_id,
              learning_courses (
                id,
                title
              )
            )
          `)
          .in("id", lessonIds);

        if (lessonsError) throw lessonsError;

        // Mapear lições com prioridade e justificativa
        const enrichedLessons = lessonsData.map(lesson => {
          const recommendationData = trail.recommended_lessons?.find(l => l.lessonId === lesson.id);
          
          // Acessar dados do módulo e curso corretamente
          const moduleData = lesson.learning_modules;
          let courseData = null;
          
          if (moduleData && moduleData.learning_courses) {
            // Como a tipagem exata pode variar, usamos uma verificação segura
            courseData = moduleData.learning_courses;
          }
          
          return {
            ...lesson,
            priority: recommendationData?.priority || 2,
            justification: recommendationData?.justification || "Recomendado com base no seu perfil",
            module: {
              ...moduleData,
              course: courseData
            }
          };
        });

        // Ordenar por prioridade
        enrichedLessons.sort((a, b) => (a.priority || 2) - (b.priority || 2));

        setLessons(enrichedLessons);
      } catch (error) {
        console.error("Erro ao buscar aulas para a trilha:", error);
        toast.error("Erro ao carregar aulas recomendadas");
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessonsForTrail();
  }, [trail]);

  // Gerar ou regenerar a trilha
  const handleGenerateTrail = async () => {
    try {
      toast.info("Gerando sua trilha personalizada...");
      await generateImplementationTrail(progress);
      toast.success("Trilha gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar trilha:", error);
      toast.error("Erro ao gerar sua trilha");
    }
  };

  // Atualizar a trilha
  const handleRefreshTrail = async () => {
    try {
      toast.info("Atualizando sua trilha...");
      await refreshTrail(true);
      toast.success("Trilha atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar trilha:", error);
      toast.error("Erro ao atualizar sua trilha");
    }
  };

  // Conteúdo durante carregamento
  if (isLoading || loadingSolutions || regenerating) {
    return (
      <div className="flex flex-col items-center py-8">
        <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin mb-4" />
        <p className="text-neutral-300">
          {regenerating 
            ? "Gerando sua trilha personalizada..." 
            : "Carregando recomendações..."}
        </p>
      </div>
    );
  }

  // Conteúdo quando não há trilha
  if (!hasContent || solutions.length === 0) {
    return (
      <div className="flex flex-col items-center py-8">
        <div className="bg-neutral-800/20 p-6 rounded-lg border border-neutral-700/50 text-center max-w-md mx-auto">
          <h3 className="text-lg font-medium text-white mb-4">Nenhuma trilha encontrada</h3>
          <p className="text-neutral-400 mb-6">
            Vamos gerar uma trilha personalizada baseada em seu perfil e objetivos de negócio.
          </p>
          <Button 
            onClick={handleGenerateTrail}
            disabled={regenerating}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            {regenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar minha trilha personalizada
          </Button>
        </div>
      </div>
    );
  }

  // Conteúdo principal - Trail tabs
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-white">Sua trilha personalizada</h3>
        <Button 
          onClick={handleRefreshTrail}
          variant="outline" 
          disabled={refreshing || regenerating}
          className="flex items-center"
        >
          {(refreshing || regenerating) ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Atualizar trilha
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="soluções">Soluções Recomendadas</TabsTrigger>
          <TabsTrigger value="aprendizado">Material de Aprendizado</TabsTrigger>
        </TabsList>
        <TabsContent value="soluções" className="space-y-4">
          <TrailSolutionsList solutions={solutions} />
        </TabsContent>
        <TabsContent value="aprendizado" className="space-y-4">
          {loadingLessons ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 text-[#0ABAB5] animate-spin" />
            </div>
          ) : lessons.length > 0 ? (
            <TrailLessonsList lessons={lessons} />
          ) : (
            <div className="text-center py-8 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
              <p className="text-neutral-400">Nenhuma aula recomendada encontrada na sua trilha.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
