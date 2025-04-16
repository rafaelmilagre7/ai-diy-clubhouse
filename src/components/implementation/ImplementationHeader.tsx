
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Book, Info, LifeBuoy, BarChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Solution } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

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
  const progress = calculateProgress();
  
  const moduleTypes = [
    "Visão Geral",
    "Preparação Express",
    "Implementação",
    "Verificação",
    "Resultados",
    "Otimização",
    "Celebração"
  ];
  
  const currentModuleType = moduleTypes[moduleIdx] || `Módulo ${moduleIdx + 1}`;
  
  return (
    <div className="sticky top-0 z-10 bg-white shadow-sm pt-2 pb-2">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/solution/${solution.id}`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Voltar para detalhes
            </Button>
            
            <Breadcrumb className="mt-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigate('/dashboard')}>Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigate(`/solution/${solution.id}`)}>
                    {solution.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink className="font-semibold">
                    {currentModuleType}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Book className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Material de referência</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Informações do módulo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <LifeBuoy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Obter suporte</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center">
              <BarChart className="h-3 w-3 mr-1" />
              Seu progresso
            </span>
            <span className="text-xs font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Módulo {moduleIdx + 1} de {modulesLength}</span>
            <span>{moduleIdx === modulesLength - 1 ? "Conclusão" : `Próximo: ${moduleTypes[Math.min(moduleIdx + 1, moduleTypes.length - 1)]}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
