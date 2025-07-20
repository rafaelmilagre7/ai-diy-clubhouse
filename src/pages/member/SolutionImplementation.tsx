import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useImplementationNavigation } from "@/hooks/implementation/useImplementationNavigation";
import { Module } from "@/lib/supabase";
import { ImplementationNavigation } from "@/components/implementation/ImplementationNavigation";
import { ImplementationTabs } from "@/components/implementation/ImplementationTabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransition } from "@/components/transitions/PageTransition";

const SolutionImplementation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { solution, loading, error } = useSolutionData(id);
  const { 
    handleComplete, 
    handlePrevious, 
    handleNavigateToModule,
    currentModuleIdx 
  } = useImplementationNavigation();
  
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  
  useEffect(() => {
    if (solution && solution.modules) {
      setModules(solution.modules);
      
      // Garante que currentModuleIdx está dentro dos limites de modules
      const safeModuleIdx = Math.min(currentModuleIdx, solution.modules.length - 1);
      setCurrentModule(solution.modules[safeModuleIdx]);
    }
  }, [solution, currentModuleIdx]);
  
  useEffect(() => {
    // Atualiza o estado completedModules com base no progresso da solução
    if (solution && solution.progress) {
      const completedModuleIndices = solution.progress.completed_modules.map(moduleId => {
        return solution.modules.findIndex(module => module.id === moduleId);
      }).filter(index => index !== -1); // Remove índices inválidos
      
      setCompletedModules(completedModuleIndices);
    }
  }, [solution]);
  
  const handleGoBack = () => {
    navigate(`/solution/${id}`);
  };
  
  return (
    <PageTransition>
      {/* Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-viverblue/8 via-transparent to-viverblue-dark/12" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-viverblue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-viverblue-dark/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative min-h-screen">
        {/* Glassmorphism Container */}
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 mx-4 mt-4 rounded-2xl shadow-2xl overflow-hidden">
          {/* Subtle dots pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }} />
          </div>
          
          {/* Content */}
          <div className="relative">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleGoBack}
                  className="text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                
                {solution && (
                  <div className="text-center flex-1 mx-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-viverblue-light to-viverblue bg-clip-text text-transparent">
                      {solution.title}
                    </h1>
                    <p className="text-sm text-neutral-400 mt-1">
                      Módulo {currentModuleIdx + 1} de {modules.length}
                    </p>
                  </div>
                )}
                
                <div className="w-[88px]" /> {/* Spacer for centering */}
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              {error ? (
                <div className="text-center py-12">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="text-lg font-medium text-red-400 mb-2">Erro ao carregar</h3>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Navigation Sidebar */}
                  <div className="lg:col-span-1">
                    <ImplementationNavigation
                      modules={modules}
                      currentModuleIndex={currentModuleIdx}
                      completedModules={completedModules}
                      onModuleSelect={handleNavigateToModule}
                    />
                  </div>
                  
                  {/* Module Content */}
                  <div className="lg:col-span-3">
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl">
                      <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
                        <div className="absolute inset-0 rounded-xl" style={{
                          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
                          backgroundSize: '15px 15px'
                        }} />
                      </div>
                      
                      <div className="relative">
                        <ImplementationTabs
                          module={currentModule}
                          onComplete={handleComplete}
                          onPrevious={handlePrevious}
                          canGoNext={true}
                          canGoPrevious={currentModuleIdx > 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SolutionImplementation;
