
import React from "react";
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle, ArrowRight } from "lucide-react";

interface SolutionSidebarProps {
  solution: Solution;
  progress: any;
  startImplementation: () => Promise<any>;
  continueImplementation: () => Promise<any>;
  initializing: boolean;
}

export const SolutionSidebar = ({ 
  solution, 
  progress, 
  startImplementation, 
  continueImplementation, 
  initializing 
}: SolutionSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Glassmorphism Progress Card */}
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-2xl">
        {/* Subtle dots pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
          <div className="absolute inset-0 rounded-xl" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '15px 15px'
          }} />
        </div>
        
        <div className="relative">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-viverblue-light bg-clip-text text-transparent">
            Progresso da Implementação
          </h3>
          
          {progress ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-neutral-400 mb-2">Progresso atual</p>
                <div className="bg-viverblue/10 rounded-lg p-3 mb-4">
                  <p className="text-viverblue-light font-medium">Em andamento</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Módulo {(progress.current_module || 0) + 1}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={continueImplementation}
                disabled={initializing}
                className="w-full bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-light hover:to-viverblue text-white border-0 shadow-lg hover:shadow-viverblue/20 transition-all duration-300"
              >
                {initializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continuar Implementação
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-neutral-300 mb-4">
                Pronto para começar a implementação?
              </p>
              <Button
                onClick={startImplementation}
                disabled={initializing}
                className="w-full bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-light hover:to-viverblue text-white border-0 shadow-lg hover:shadow-viverblue/20 transition-all duration-300"
              >
                {initializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Começar Implementação
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Glassmorphism Quick Actions Card */}
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-2xl">
        <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
          <div className="absolute inset-0 rounded-xl" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '15px 15px'
          }} />
        </div>
        
        <div className="relative">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-viverblue-light bg-clip-text text-transparent">
            Ações Rápidas
          </h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-viverblue/10 hover:bg-viverblue/15 rounded-lg border border-viverblue/20 text-viverblue-light transition-colors">
              Adicionar aos Favoritos
            </button>
            <button className="w-full p-3 bg-viverblue/10 hover:bg-viverblue/15 rounded-lg border border-viverblue/20 text-viverblue-light transition-colors">
              Baixar Materiais
            </button>
          </div>
        </div>
      </div>

      {/* Glassmorphism Solution Details Card */}
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-2xl">
        <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
          <div className="absolute inset-0 rounded-xl" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '15px 15px'
          }} />
        </div>
        
        <div className="relative">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-viverblue-light bg-clip-text text-transparent">
            Detalhes da Solução
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Categoria:</span>
              <span className="text-viverblue-light">{solution.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Dificuldade:</span>
              <span className="text-viverblue-light capitalize">{solution.difficulty}</span>
            </div>
            {solution.estimated_time && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Tempo estimado:</span>
                <span className="text-viverblue-light">{solution.estimated_time} min</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
