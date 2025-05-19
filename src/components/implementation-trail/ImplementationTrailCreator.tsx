import React, { useState, useEffect, useCallback } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useLearningCourses } from "@/hooks/learning/useLearningCourses";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, AlertTriangle, Info, Book } from "lucide-react";
import { TrailSolutionsList } from "./TrailSolutionsList";
import { TrailCoursesList } from "./TrailCoursesList";
import { TrailLessonsList } from "./TrailLessonsList";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

export const ImplementationTrailCreator = () => {
  const { trail, isLoading, error, hasContent, generateImplementationTrail, refreshTrail, regenerating, refreshing } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const { courses: allCourses, isLoading: coursesLoading } = useLearningCourses();
  const [processedSolutions, setProcessedSolutions] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [recommendedLessons, setRecommendedLessons] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [missingIds, setMissingIds] = useState<string[]>([]);
  const [isProcessingData, setIsProcessingData] = useState(false);
  const [courseDataFetched, setCourseDataFetched] = useState(false);
  
  // Console log para debug
  useEffect(() => {
    if (trail) {
      console.log("Trail data:", trail);
      console.log("Recommended courses in trail:", trail.recommended_courses);
      console.log("Recommended lessons in trail:", trail.recommended_lessons);
    }
    
    if (allCourses) {
      console.log("Available courses:", allCourses);
    }
  }, [trail, allCourses]);
  
  // Processar soluções quando os dados estiverem disponíveis
  useEffect(() => {
    const processSolutions = () => {
      if (isProcessingData) return;
      
      if (!trail || !allSolutions?.length) {
        setProcessedSolutions([]);
        return;
      }

      try {
        setIsProcessingData(true);
        const result = [];
        const missingIdsList: string[] = [];
        
        // Função auxiliar para processar itens por prioridade
        const processItems = (items: any[] = [], priority: number) => {
          if (!Array.isArray(items)) {
            console.warn("Dados de prioridade não são um array:", items);
            return;
          }
          
          items.forEach((item: any) => {
            if (!item || !item.solutionId) return;
            
            const solution = allSolutions.find(s => s.id === item.solutionId);
            if (solution) {
              result.push({
                ...solution,
                ...item,
                priority
              });
            } else {
              // Registrar IDs de soluções ausentes
              missingIdsList.push(item.solutionId);
            }
          });
        };
        
        // Processar cada nível de prioridade
        if (trail.priority1) processItems(trail.priority1, 1);
        if (trail.priority2) processItems(trail.priority2, 2);
        if (trail.priority3) processItems(trail.priority3, 3);

        setProcessedSolutions(result);
        setMissingIds(missingIdsList);
        
        // Mostrar aviso se alguma solução não foi encontrada
        if (missingIdsList.length > 0) {
          console.warn("Algumas soluções na trilha não foram encontradas:", missingIdsList);
        }
      } catch (error) {
        console.error("Erro ao processar soluções:", error);
      } finally {
        setIsProcessingData(false);
      }
    };

    processSolutions();
  }, [trail, allSolutions, isProcessingData]);
  
  // Atualização: Processar recomendações de aulas específicas
  useEffect(() => {
    const processRecommendedLessons = async () => {
      // Evitar execução repetida ou quando está processando
      if (loadingCourses || courseDataFetched || !trail) {
        return;
      }

      try {
        setLoadingCourses(true);
        
        // Verificar se tem recomendações de aulas na trilha
        if (!trail.recommended_lessons || !Array.isArray(trail.recommended_lessons) || trail.recommended_lessons.length === 0) {
          console.log("Sem recomendações de aulas na trilha");
          
          // Verificar se temos recomendações de cursos para tentar extrair aulas deles
          if (trail.recommended_courses && trail.recommended_courses.length > 0 && allCourses && allCourses.length > 0) {
            console.log("Tentando extrair aulas dos cursos recomendados");
            
            // Obter todas as aulas disponíveis
            const allAvailableLessons = allCourses.flatMap(course => course.all_lessons || []);
            
            if (allAvailableLessons.length > 0) {
              // Obter os IDs dos cursos recomendados
              const recommendedCourseIds = trail.recommended_courses.map(c => c.courseId);
              
              // Filtrar aulas dos cursos recomendados 
              const lessonsFromRecommendedCourses = allAvailableLessons
                .filter(lesson => recommendedCourseIds.includes(lesson.module.course.id))
                .slice(0, 6) // Limitar a 6 aulas para não sobrecarregar a interface
                .map(lesson => ({
                  ...lesson,
                  justification: `Aula do curso "${lesson.module.course.title}" recomendado para seu perfil`,
                  priority: 1
                }));
              
              if (lessonsFromRecommendedCourses.length > 0) {
                console.log("Aulas extraídas dos cursos recomendados:", lessonsFromRecommendedCourses);
                setRecommendedLessons(lessonsFromRecommendedCourses);
                setCourseDataFetched(true);
                setLoadingCourses(false);
                return;
              }
            }
          }
          
          // Se não temos recomendações de aulas nem conseguimos extrair dos cursos
          setRecommendedLessons([]);
          setCourseDataFetched(true);
          setLoadingCourses(false);
          return;
        }
        
        console.log("Processando recomendações de aulas:", trail.recommended_lessons);
        
        // Extrair IDs das aulas recomendadas
        const lessonIds = trail.recommended_lessons
          .filter(l => l && l.lessonId)
          .map(l => l.lessonId);
        
        if (lessonIds.length === 0 || !allCourses || allCourses.length === 0) {
          setRecommendedLessons([]);
          setCourseDataFetched(true);
          setLoadingCourses(false);
          return;
        }
        
        // Obter todas as aulas disponíveis
        const allAvailableLessons = allCourses.flatMap(course => course.all_lessons || []);
        
        console.log("Todas as aulas disponíveis:", allAvailableLessons.length);
        console.log("IDs de aulas a buscar:", lessonIds);
        
        // Filtrar as aulas correspondentes
        const matchingLessons = allAvailableLessons.filter(lesson => lessonIds.includes(lesson.id));
        
        console.log("Aulas correspondentes encontradas:", matchingLessons.length);
        
        // Combinar os dados das aulas com as justificativas da trilha
        const enrichedLessons = matchingLessons.map(lesson => {
          const recommendation = trail.recommended_lessons.find(r => r.lessonId === lesson.id);
          return {
            ...lesson,
            justification: recommendation?.justification || "Recomendado para seu perfil",
            priority: recommendation?.priority || 1
          };
        });
        
        console.log("Aulas enriquecidas:", enrichedLessons);
        setRecommendedLessons(enrichedLessons);
      } catch (error) {
        console.error("Erro ao processar aulas recomendadas:", error);
      } finally {
        setLoadingCourses(false);
        setCourseDataFetched(true);
      }
    };

    // Processar recomendações de cursos (código existente)
    const processRecommendedCourses = async () => {
      // Evitar execução repetida ou quando está processando
      if (loadingCourses || courseDataFetched || !trail) {
        return;
      }

      try {
        setLoadingCourses(true);
        
        // Verificar se tem recomendações na trilha
        if (!trail.recommended_courses || !Array.isArray(trail.recommended_courses) || trail.recommended_courses.length === 0) {
          console.log("Sem recomendações de cursos na trilha");
          setRecommendedCourses([]);
          setCourseDataFetched(true);
          return;
        }
        
        console.log("Processando recomendações de cursos:", trail.recommended_courses);
        
        // Extrair IDs dos cursos recomendados
        const courseIds = trail.recommended_courses
          .filter(c => c && c.courseId)
          .map(c => c.courseId);
        
        if (courseIds.length === 0 || !allCourses || allCourses.length === 0) {
          setRecommendedCourses([]);
          setCourseDataFetched(true);
          return;
        }
        
        console.log("IDs de cursos a buscar:", courseIds);
        console.log("Cursos disponíveis:", allCourses.map(c => c.id));
        
        // Filtrar os cursos correspondentes do array de todos os cursos já carregado
        const matchingCourses = allCourses.filter(course => courseIds.includes(course.id));
        
        console.log("Cursos correspondentes encontrados:", matchingCourses.length);
        
        // Combinar os dados dos cursos com as justificativas da trilha
        const enrichedCourses = matchingCourses.map(course => {
          const recommendation = trail.recommended_courses.find(r => r.courseId === course.id);
          return {
            ...course,
            justification: recommendation?.justification || "Recomendado para seu perfil",
            priority: recommendation?.priority || 1
          };
        });
        
        console.log("Cursos enriquecidos:", enrichedCourses);
        setRecommendedCourses(enrichedCourses);
      } catch (error) {
        console.error("Erro ao processar cursos recomendados:", error);
      } finally {
        setLoadingCourses(false);
        setCourseDataFetched(true);
      }
    };

    // Chamar ambos os processadores
    processRecommendedLessons();
    processRecommendedCourses();
  }, [trail, allCourses, loadingCourses, courseDataFetched, coursesLoading]);

  // Modificar apenas a função loadTrailData para armazenar dados do onboarding
  const loadTrailData = useCallback(async (forceRefresh = false) => {
    if (!user || !isMountedRef.current) {
      setIsLoading(false);
      return null;
    }

    // Prevenir chamadas duplicadas
    if (pendingRequestRef.current) {
      console.log("[useImplementationTrail] Requisição já em andamento, ignorando chamada duplicada");
      return null;
    }

    const currentCancelToken = Math.random().toString(36);
    cancelTokenRef.current = currentCancelToken;

    try {
      pendingRequestRef.current = true;
      setRefreshing(true);
      setError(null);

      let trailData;

      // Buscar dados do onboarding para personalização
      const { data: onboardingData, error: onboardingError } = await supabase
        .from("onboarding_progress")
        .select(`
          personal_info,
          professional_info,
          business_goals,
          business_context,
          ai_experience
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (onboardingData) {
        // Salvar dados do onboarding para personalização
        try {
          localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
        } catch (e) {
          console.error("Erro ao salvar dados do onboarding:", e);
        }
      }

      // Se não forçar atualização, tentar obter do armazenamento local primeiro
      if (!forceRefresh) {
        trailData = getTrailFromLocalStorage(user.id);
        
        if (trailData) {
          console.log("[useImplementationTrail] Usando dados da trilha do armazenamento local");
          if (isMountedRef.current && cancelTokenRef.current === currentCancelToken) {
            setTrail(sanitizeTrailData(trailData.trail_data));
            setHasContent(true);
            setIsLoading(false);
            setRefreshing(false);
          }
          pendingRequestRef.current = false;
          return trailData.trail_data;
        }
      }

      // Buscar do banco de dados
      const { data, error } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Verificar se a operação foi cancelada
      if (!isMountedRef.current || cancelTokenRef.current !== currentCancelToken) return null;

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado (código PGRST116), não é um erro real
          console.log("[useImplementationTrail] Nenhuma trilha encontrada para o usuário");
          setTrail(null);
          setHasContent(false);
        } else {
          console.error("[useImplementationTrail] Erro ao carregar trilha:", error);
          setError(error);
        }
      } else if (data) {
        console.log("[useImplementationTrail] Trilha carregada com sucesso:", data);
        try {
          const sanitizedData = sanitizeTrailData(data.trail_data);
          setTrail(sanitizedData);
          setHasContent(true);
          
          // Salvar no armazenamento local para uso futuro
          saveTrailToLocalStorage(user.id, data);
          return data.trail_data;
        } catch (parseError) {
          console.error("[useImplementationTrail] Erro ao processar dados da trilha:", parseError);
          setError(parseError instanceof Error ? parseError : new Error(String(parseError)));
        }
      }
      return null;
    } catch (err) {
      if (isMountedRef.current && cancelTokenRef.current === currentCancelToken) {
        console.error("[useImplementationTrail] Erro ao processar dados da trilha:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
      return null;
    } finally {
      if (isMountedRef.current && cancelTokenRef.current === currentCancelToken) {
        setIsLoading(false);
        setRefreshing(false);
      }
      
      // Liberar flag com atraso para evitar condição de corrida
      setTimeout(() => {
        pendingRequestRef.current = false;
      }, 300);
    }
  }, [user]);

  // Função para gerar a trilha
  const handleGenerateTrail = useCallback(async () => {
    // Evitar múltiplas chamadas
    if (isGenerating || regenerating) {
      return;
    }

    try {
      setIsGenerating(true);
      // Limpar estado para permitir re-busca
      setCourseDataFetched(false);
      setRecommendedCourses([]);
      
      toast.info("Gerando sua trilha personalizada...");
      // Passamos null explicitamente, que agora é permitido pela tipagem
      await generateImplementationTrail(null, true); // Forçando regeneração completa da trilha
      
      toast.success("Trilha personalizada gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar trilha:", error);
      toast.error("Não foi possível gerar sua trilha. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, regenerating, generateImplementationTrail]);

  // Função para atualizar a trilha
  const handleRefreshTrail = useCallback(async () => {
    try {
      // Limpar estado para permitir re-busca
      setCourseDataFetched(false);
      setRecommendedCourses([]);
      
      await refreshTrail(true); // Forçando atualização completa
      toast.success("Trilha atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar trilha:", error);
      toast.error("Erro ao atualizar trilha. Tente novamente.");
    }
  }, [refreshTrail]);

  // Estado de carregamento
  if (isLoading || solutionsLoading || regenerating || loadingCourses || coursesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] py-8">
        <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin mb-4" />
        <p className="text-neutral-300">
          {regenerating 
            ? "Gerando sua trilha personalizada..." 
            : refreshing 
              ? "Atualizando dados da trilha..." 
              : loadingCourses
                ? "Carregando aulas recomendadas..."
                : "Carregando sua trilha personalizada..."}
        </p>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-900/40 rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2 text-white">Erro ao carregar trilha</h3>
        <p className="text-neutral-300 mb-4">
          Não foi possível carregar sua trilha personalizada.
        </p>
        <Button 
          onClick={handleGenerateTrail} 
          disabled={isGenerating || regenerating}
        >
          {isGenerating || regenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            "Tentar Novamente"
          )}
        </Button>
      </div>
    );
  }

  // Se não há conteúdo na trilha, exibir opção para gerar
  if (!hasContent || (processedSolutions.length === 0 && recommendedCourses.length === 0 && recommendedLessons.length === 0)) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="bg-[#151823]/80 border border-[#0ABAB5]/20 rounded-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-medium mb-4 text-white">Vamos criar sua trilha personalizada</h3>
          <p className="text-neutral-300 mb-6">
            Baseado nas suas respostas do onboarding, vamos gerar uma trilha 
            de implementação exclusiva para o seu negócio.
          </p>
          <Button 
            onClick={handleGenerateTrail} 
            disabled={isGenerating || regenerating}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            {isGenerating || regenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Trilha...
              </>
            ) : (
              "Gerar Minha Trilha"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Exibir a trilha quando estiver disponível
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Sua trilha personalizada</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshTrail}
          disabled={refreshing || regenerating || isGenerating}
          className="border-neutral-700 hover:border-[#0ABAB5] hover:bg-[#0ABAB5]/10"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </>
          )}
        </Button>
      </div>
      
      {missingIds.length > 0 && (
        <Alert variant="warning" className="bg-amber-900/20 border-amber-700/40 text-amber-300">
          <Info className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300">
            Algumas soluções recomendadas não estão mais disponíveis. A trilha foi atualizada.
          </AlertDescription>
        </Alert>
      )}
      
      <Separator className="bg-neutral-800" />
      
      {/* Soluções recomendadas */}
      {processedSolutions.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-[#0ABAB5] flex items-center gap-2">
            Soluções recomendadas para implementação
          </h4>
          <TrailSolutionsList solutions={processedSolutions} />
        </div>
      )}
      
      {/* Aulas recomendadas */}
      <Separator className="bg-neutral-800 my-6" />
      <div className="space-y-4">
        <h4 className="font-medium text-[#0ABAB5] flex items-center gap-2">
          <Book className="h-5 w-5" />
          Aulas recomendadas para você
        </h4>
        
        {recommendedLessons && recommendedLessons.length > 0 ? (
          <TrailLessonsList lessons={recommendedLessons} />
        ) : (
          <div className="text-center py-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50 p-4">
            <div className="flex flex-col items-center gap-2">
              <Book className="h-8 w-8 text-neutral-500" />
              <p className="text-neutral-400">Nenhuma aula recomendada encontrada na sua trilha.</p>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleRefreshTrail}
                className="mt-2"
                disabled={refreshing || regenerating}
              >
                Atualizar recomendações
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Mostrar botão para gerar novamente se não temos recomendações suficientes */}
      {processedSolutions.length === 0 && recommendedLessons.length === 0 && recommendedCourses.length === 0 && (
        <div className="pt-6 text-center">
          <p className="text-neutral-400 mb-4">Não foram encontradas recomendações na sua trilha.</p>
          <Button 
            onClick={handleGenerateTrail}
            disabled={isGenerating || regenerating}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            {isGenerating || regenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar Novamente"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
