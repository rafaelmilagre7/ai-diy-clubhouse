import React from "react";
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle } from "lucide-react";
import { SolutionProgressDisplay } from "./SolutionProgressDisplay";
import { SolutionQuickActions } from "./SolutionQuickActions";
import { SolutionDetailsCard } from "./SolutionDetailsCard";

interface SolutionSidebarProps {
  solution: Solution;
  progress: any;
  startImplementation: () => Promise<any>;
  continueImplementation: () => Promise<void>;
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
            <SolutionProgressDisplay progress={progress} />
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
          <SolutionQuickActions solution={solution} />
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
          <SolutionDetailsCard solution={solution} />
        </div>
      </div>
    </div>
  );
};
