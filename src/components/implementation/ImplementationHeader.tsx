
import React from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Solution } from "@/types/solution";

interface ImplementationHeaderProps {
  solution: Solution;
  moduleIdx?: number;
  totalModules?: number;
}

export const ImplementationHeader = ({
  solution,
  moduleIdx = 0,
  totalModules = 1
}: ImplementationHeaderProps) => {
  return (
    <div className="bg-white border-b">
      <div className="container py-4">
        <div className="flex flex-col space-y-2">
          <Link to={`/solution/${solution.id}`} className="flex items-center text-blue-600 hover:text-blue-800">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Voltar para detalhes</span>
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{solution.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                <span>Módulo {moduleIdx + 1} de {totalModules}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
