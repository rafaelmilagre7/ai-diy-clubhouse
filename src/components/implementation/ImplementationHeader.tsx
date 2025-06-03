
import React from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Solution, Module, Progress } from "@/lib/supabase";

interface ImplementationHeaderProps {
  solution: Solution;
  currentModule?: Module | null;
  progress?: Progress | null;
}

export const ImplementationHeader = ({
  solution,
  currentModule,
  progress
}: ImplementationHeaderProps) => {
  return (
    <div className="bg-[#0F111A] border-b border-white/10">
      <div className="container py-4">
        <div className="flex flex-col space-y-2">
          <Link to={`/solution/${solution.id}`} className="flex items-center text-viverblue hover:text-viverblue-light">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Voltar para detalhes</span>
          </Link>
          
          <div className="flex items-center space-x-2 text-sm text-neutral-400">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-neutral-200">{solution.title}</span>
            {currentModule && (
              <>
                <span>/</span>
                <span className="text-neutral-200">{currentModule.title}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
