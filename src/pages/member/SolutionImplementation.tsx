
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase, Solution, Module } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ImplementationNavigation } from "@/components/implementation/ImplementationNavigation";
import { ImplementationProgress } from "@/components/implementation/ImplementationProgress";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

const SolutionImplementation = () => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { log, logError } = useLogging();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentModuleIndex = parseInt(moduleIndex || "0");
  const currentModule = modules[currentModuleIndex];

  // Memoized progress calculation
  const progressPercentage = useMemo(() => {
    if (modules.length === 0) return 0;
    return Math.round((completedModules.length / modules.length) * 100);
  }, [completedModules.length, modules.length]);

  // Load solution and create dynamic modules from real data
  useEffect(() => {
    const loadSolutionData = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        
        // Load solution
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();

        if (solutionError) throw solutionError;
        setSolution(solutionData);
        
        // Load progress
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("solution_id", id)
          .maybeSingle();

        if (progressError && progressError.code !== "PGRST116") {
          throw progressError;
        }

        if (progressData) {
          setProgress(progressData);
          setCompletedModules(progressData.completed_modules || []);
        }

        // Create dynamic modules based on solution data
        const dynamicModules: Module[] = [];

        // Landing module
        dynamicModules.push({
          id: `${id}-landing`,
          solution_id: id,
          title: "Introdução",
          content: `Bem-vindo à implementação da solução: **${solutionData.title}**\n\n${solutionData.description || "Vamos começar a implementar esta solução passo a passo."}`,
          type: "landing",
          order_index: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // Tools module (if solution has tools)
        if (solutionData.tools && Array.isArray(solutionData.tools) && solutionData.tools.length > 0) {
          dynamicModules.push({
            id: `${id}-tools`,
            solution_id: id,
            title: "Ferramentas Necessárias",
            content: `Para implementar esta solução, você precisará das seguintes ferramentas:\n\n${solutionData.tools.map((tool: any) => `- **${tool.name || tool}**: ${tool.description || "Ferramenta essencial para esta implementação"}`).join("\n")}`,
            type: "tools",
            order_index: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        // Implementation steps modules
        if (solutionData.implementation_steps && Array.isArray(solutionData.implementation_steps)) {
          solutionData.implementation_steps.forEach((step: any, index: number) => {
            dynamicModules.push({
              id: `${id}-step-${index}`,
              solution_id: id,
              title: step.title || `Etapa ${index + 1}`,
              content: step.description || step.content || "Siga as instruções para completar esta etapa.",
              type: "step",
              order_index: dynamicModules.length,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          });
        }

        // Videos module (if solution has videos)
        if (solutionData.video_lessons && Array.isArray(solutionData.video_lessons) && solutionData.video_lessons.length > 0) {
          dynamicModules.push({
            id: `${id}-videos`,
            solution_id: id,
            title: "Vídeos de Apoio",
            content: `Assista aos vídeos explicativos:\n\n${solutionData.video_lessons.map((video: any) => `- **${video.title}**: ${video.description || "Vídeo explicativo"}`).join("\n")}`,
            type: "videos",
            order_index: dynamicModules.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        // Checklist module (if solution has checklist)
        if (solutionData.checklist_items && Array.isArray(solutionData.checklist_items) && solutionData.checklist_items.length > 0) {
          dynamicModules.push({
            id: `${id}-checklist`,
            solution_id: id,
            title: "Lista de Verificação",
            content: `Confirme se você completou todos os itens:\n\n${solutionData.checklist_items.map((item: any) => `- [ ] ${item.title || item.description || item}`).join("\n")}`,
            type: "checklist",
            order_index: dynamicModules.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        // Completion module
        dynamicModules.push({
          id: `${id}-completion`,
          solution_id: id,
          title: "Parabéns!",
          content: `Você completou a implementação de **${solutionData.title}**!\n\nAgora você tem todas as ferramentas e conhecimentos necessários para usar esta solução em seu negócio.`,
          type: "celebration",
          order_index: dynamicModules.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        setModules(dynamicModules);
        
        log("Solution implementation loaded", {
          solutionId: id,
          modulesCount: dynamicModules.length,
          currentModule: currentModuleIndex
        });

      } catch (err: any) {
        logError("Error loading solution implementation", err);
        setError(err.message);
        toast.error("Erro ao carregar implementação");
      } finally {
        setLoading(false);
      }
    };

    loadSolutionData();
  }, [id, user, currentModuleIndex, log, logError]);

  const handleNext = async () => {
    if (currentModuleIndex < modules.length - 1) {
      navigate(`/implement/${id}/${currentModuleIndex + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentModuleIndex > 0) {
      navigate(`/implement/${id}/${currentModuleIndex - 1}`);
    } else {
      navigate(`/solution/${id}`);
    }
  };

  const handleModuleComplete = async () => {
    if (!user || !progress || completedModules.includes(currentModuleIndex)) {
      handleNext();
      return;
    }

    try {
      const newCompletedModules = [...completedModules, currentModuleIndex];
      
      // Update progress in database
      await supabase
        .from("progress")
        .update({
          current_module: Math.min(currentModuleIndex + 1, modules.length - 1),
          completed_modules: newCompletedModules,
          is_completed: newCompletedModules.length >= modules.length,
          last_activity: new Date().toISOString()
        })
        .eq("id", progress.id);

      setCompletedModules(newCompletedModules);
      
      if (newCompletedModules.length >= modules.length) {
        toast.success("🎉 Implementação concluída com sucesso!");
      } else {
        toast.success("Módulo concluído!");
      }

      handleNext();
    } catch (err) {
      logError("Error completing module", err);
      toast.error("Erro ao salvar progresso");
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }

  if (error || !solution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erro ao carregar implementação
          </h1>
          <p className="text-gray-600 mb-4">{error || "Solução não encontrada"}</p>
          <Button onClick={() => navigate("/solutions")}>
            Voltar para Soluções
          </Button>
        </div>
      </div>
    );
  }

  if (currentModuleIndex >= modules.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Módulo não encontrado</h1>
          <Button onClick={() => navigate(`/solution/${id}`)}>
            Voltar para Solução
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentModuleIndex === 0 ? "Voltar para Solução" : "Módulo Anterior"}
            </Button>
            
            <FadeTransition>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {solution.title}
              </h1>
              <p className="text-gray-600">
                Implementação • Módulo {currentModuleIndex + 1} de {modules.length}
              </p>
            </FadeTransition>
          </div>

          {/* Progress */}
          <FadeTransition delay={0.1}>
            <ImplementationProgress
              progress={progressPercentage}
              currentStep={currentModuleIndex + 1}
              totalSteps={modules.length}
              completedModules={completedModules}
            />
          </FadeTransition>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <FadeTransition delay={0.2} direction="left">
                <ImplementationNavigation
                  modules={modules}
                  currentModuleIndex={currentModuleIndex}
                  completedModules={completedModules}
                  onModuleSelect={(index) => navigate(`/implement/${id}/${index}`)}
                />
              </FadeTransition>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <FadeTransition delay={0.3}>
                <div className="bg-white rounded-lg shadow-sm border p-8 min-h-[600px]">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentModule?.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Módulo {currentModuleIndex + 1}</span>
                      {completedModules.includes(currentModuleIndex) && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Concluído</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <ModuleContent
                    module={currentModule}
                    onComplete={handleModuleComplete}
                  />

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-8 border-t mt-8">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {currentModuleIndex === 0 ? "Voltar" : "Anterior"}
                    </Button>

                    {currentModuleIndex < modules.length - 1 ? (
                      <Button onClick={handleModuleComplete}>
                        Próximo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleModuleComplete} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Finalizar
                      </Button>
                    )}
                  </div>
                </div>
              </FadeTransition>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SolutionImplementation;
