
import React, { useState } from "react";
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, PlayCircle, Clock, Users, TrendingUp, Handshake } from "lucide-react";
import { ContractImplementationModal } from "./ContractImplementationModal";

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
  const [showContractModal, setShowContractModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Card de Implementação */}
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-2xl group hover:bg-white/8 transition-all duration-500">
        {/* Subtle dots pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
          <div className="absolute inset-0 rounded-xl" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '15px 15px'
          }} />
        </div>
        
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-viverblue/15 to-viverblue-dark/15 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
        
        <div className="relative">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-viverblue-light bg-clip-text text-transparent">
            Implementação
          </h3>
          
          {progress ? (
            <div className="space-y-4">
              <div className="bg-viverblue/10 rounded-lg p-3 mb-4">
                <p className="text-viverblue-light font-medium">Em andamento</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Módulo {(progress.current_module || 0) + 1}
                </p>
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
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-neutral-300 text-sm mb-2">
                  Pronto para começar sua implementação?
                </p>
              </div>
              
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
              
              {/* Botão de Contratação */}
              <Button
                onClick={() => setShowContractModal(true)}
                variant="outline"
                className="w-full border-viverblue/30 text-viverblue-light hover:bg-viverblue/10 hover:border-viverblue/50 transition-all duration-300"
              >
                <Handshake className="h-4 w-4 mr-2" />
                Contratar Implementação
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Card de Detalhes da Solução */}
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
            Detalhes
          </h3>
          
          <div className="space-y-4">
            {solution.estimated_time && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Tempo estimado
                </span>
                <Badge variant="outline" className="bg-viverblue/10 text-viverblue-light border-viverblue/20">
                  {solution.estimated_time} min
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Nível
              </span>
              <Badge variant="outline" className="bg-neutral-800/60 text-neutral-300 border-neutral-600">
                {solution.difficulty === 'easy' ? 'Iniciante' : 
                 solution.difficulty === 'medium' ? 'Intermediário' : 'Avançado'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Categoria
              </span>
              <Badge variant="outline" className="bg-viverblue/10 text-viverblue-light border-viverblue/20">
                {solution.category}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Contratação */}
      <ContractImplementationModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        solutionTitle={solution.title}
        solutionCategory={solution.category}
        solutionId={solution.id}
      />
    </div>
  );
};
