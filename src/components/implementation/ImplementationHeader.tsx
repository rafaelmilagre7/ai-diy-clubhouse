
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Book, Info, LifeBuoy } from "lucide-react";
import { Solution } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ImplementationProgress } from "./ImplementationProgress";

interface ImplementationHeaderProps {
  solution: Solution;
  moduleIdx: number;
  modulesLength: number;
  completedModules: number[];
  isCompleting: boolean;
}

export const ImplementationHeader = ({
  solution,
  moduleIdx,
  modulesLength,
  completedModules,
  isCompleting
}: ImplementationHeaderProps) => {
  const navigate = useNavigate();
  
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
          <ImplementationProgress
            currentModule={moduleIdx}
            totalModules={modulesLength}
            completedModules={completedModules}
            isCompleting={isCompleting}
          />
        </div>
      </div>
    </div>
  );
};
