
import React, { useState, useEffect, useCallback } from "react";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, AlertTriangle, Info, Book } from "lucide-react";
import { TrailSolutionsList } from "./TrailSolutionsList";
import { TrailCoursesList } from "./TrailCoursesList";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

export const ImplementationTrailCreator = () => {
  const { trail, isLoading, error, hasContent, generateImplementationTrail, refreshTrail, regenerating, refreshing } = useImplementationTrail();
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  const [processedSolutions, setProcessedSolutions] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [missingIds, setMissingIds] = useState<string[]>([]);
  const [isProcessingData, setIsProcessingData] = useState(false);
  const [courseDataFetched, setCourseDataFetched] = useState(false);
  
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
  
  // Buscar cursos recomendados
  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      // Evitar execução repetida ou quando ainda está processando
      if (loadingCourses || courseDataFetched || isProcessingData || regenerating || refreshing) {
        return;
      }
      
      // Verificar se o trail tem recomendações de cursos válidas
      if (!trail?.recommended_courses || !Array.isArray(trail.recommended_courses) || trail.recommended_courses.length === 0) {
        console.log("Sem recomendações de cursos na trilha");
        setCourseDataFetched(true);
        setRecommendedCourses([]);
        return;
      }

      try {
        setLoadingCourses(true);
        const courseIds = trail.recommended_courses
          .filter(c => c && c.courseId)  // Filtrar entradas inválidas
          .map(c => c.courseId);

        if (courseIds.length === 0) {
          setLoadingCourses(false);
          setRecommendedCourses([]);
          setCourseDataFetched(true);
          return;
        }
        
        console.log("Buscando cursos com IDs:", courseIds);
        
        // Buscar informações dos cursos no banco
        const { data: courses, error } = await supabase
          .from("learning_courses")
          .select("*, learning_modules(count)")
          .in("id", courseIds)
          .eq("published", true);
        
        if (error) {
          console.error("Erro ao buscar cursos recomendados:", error);
          setRecommendedCourses([]);
          setCourseDataFetched(true);
          return;
        }
        
        console.log("Cursos encontrados:", courses?.length);
        
        // Mapear cursos com justificativas da trilha
        const coursesWithDetails = courseIds
          .map(id => {
            const course = courses?.find(c => c.id === id);
            const recommendation = trail.recommended_courses.find(r => r && r.courseId === id);
            
            if (course) {
              return {
                ...course,
                justification: recommendation?.justification || "Recomendado para seu perfil",
                priority: recommendation?.priority || 1
              };
            }
            return null;
          })
          .filter(Boolean);
        
        console.log("Cursos processados:", coursesWithDetails?.length);
        setRecommendedCourses(coursesWithDetails || []);
        setCourseDataFetched(true);
      } catch (error) {
        console.error("Erro ao processar cursos recomendados:", error);
        setRecommendedCourses([]);
        setCourseDataFetched(true);
      } finally {
        setLoadingCourses(false);
      }
    };

    // Se temos trail mas não temos courseDataFetched, buscar os cursos
    if (trail && !courseDataFetched && !loadingCourses && !isProcessingData) {
      fetchRecommendedCourses();
    }
  }, [trail, loadingCourses, courseDataFetched, isProcessingData, regenerating, refreshing]);

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
      await generateImplementationTrail({}, true); // Forçando regeneração completa da trilha
      
      toast.success("Trilha de implementação gerada com sucesso!");
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
  if (isLoading || solutionsLoading || regenerating || loadingCourses) {
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
  if (!hasContent || (processedSolutions.length === 0 && recommendedCourses.length === 0)) {
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
      
      {/* Cursos recomendados */}
      {recommendedCourses.length > 0 && (
        <>
          <Separator className="bg-neutral-800 my-6" />
          <div className="space-y-4">
            <h4 className="font-medium text-[#0ABAB5] flex items-center gap-2">
              <Book className="h-5 w-5" />
              Aulas recomendadas para você
            </h4>
            <TrailCoursesList courses={recommendedCourses} />
          </div>
        </>
      )}
      
      {/* Mostrar botão para gerar novamente se não temos recomendações */}
      {processedSolutions.length === 0 && recommendedCourses.length === 0 && (
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
