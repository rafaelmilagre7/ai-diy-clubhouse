
import React from "react";
import { SolutionModuleCard } from "../modules/SolutionModuleCard";
import { SolutionModulesLoading } from "../modules/SolutionModulesLoading";
import { SolutionModulesEmpty } from "../modules/SolutionModulesEmpty";
import { useSolutionDataContext } from "@/contexts/SolutionDataContext";
import { useLogging } from "@/hooks/useLogging";

interface SolutionModulesTabProps {
  solutionId: string;
}

export const SolutionModulesTab = ({ solutionId }: SolutionModulesTabProps) => {
  const { data, isLoading } = useSolutionDataContext();
  const { log } = useLogging();

  if (isLoading) {
    return <SolutionModulesLoading />;
  }

  const modules = data?.modules || [];

  if (modules.length === 0) {
    log("Nenhum módulo encontrado para a solução", { solutionId });
    return <SolutionModulesEmpty />;
  }

  log("Renderizando módulos da solução", { solutionId, count: modules.length });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-textPrimary">Módulos da Solução</h3>
        <p className="text-textSecondary">
          Esta solução é composta por {modules.length} módulo{modules.length !== 1 ? 's' : ''} organizados em sequência.
        </p>
      </div>
      
      <div className="space-y-4">
        {modules.map((module, index) => (
          <SolutionModuleCard 
            key={module.id} 
            module={module} 
            moduleNumber={index + 1}
          />
        ))}
      </div>
    </div>
  );
};
