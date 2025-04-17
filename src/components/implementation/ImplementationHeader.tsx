
import React from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="bg-white border-b">
      <div className="container py-4">
        <div className="flex flex-col space-y-2">
          <Link to={`/solution/${solution.id}`} className="flex items-center text-blue-600 hover:text-blue-800">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Voltar para detalhes</span>
          </Link>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span>{solution.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
