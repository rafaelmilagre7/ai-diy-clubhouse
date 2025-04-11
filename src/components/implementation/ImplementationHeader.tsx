
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, HelpCircle, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Solution } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface ImplementationHeaderProps {
  solution: Solution;
  moduleIdx: number;
  modulesLength: number;
  calculateProgress: () => number;
}

export const ImplementationHeader = ({
  solution,
  moduleIdx,
  modulesLength,
  calculateProgress
}: ImplementationHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="sticky top-16 z-10 bg-background pt-2 pb-4 border-b">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/solution/${solution.id}`)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Voltar para detalhes
            </Button>
            <h1 className="text-2xl font-bold mt-1">{solution.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Clock className="h-4 w-4" />
              <span>Módulo {moduleIdx + 1} de {modulesLength}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <HelpCircle className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Ajuda</span>
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Suporte</span>
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <Progress value={calculateProgress()} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Início</span>
            <span>{calculateProgress()}% concluído</span>
          </div>
        </div>
      </div>
    </div>
  );
};
