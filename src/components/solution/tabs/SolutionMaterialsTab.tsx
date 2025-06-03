
import React from "react";
import { SolutionMaterialCard } from "../materials/SolutionMaterialCard";
import { SolutionMaterialsLoading } from "../materials/SolutionMaterialsLoading";
import { SolutionMaterialsEmpty } from "../materials/SolutionMaterialsEmpty";
import { useSolutionDataContext } from "@/contexts/SolutionDataContext";
import { useLogging } from "@/hooks/useLogging";

interface SolutionMaterialsTabProps {
  solutionId: string;
}

export const SolutionMaterialsTab = ({ solutionId }: SolutionMaterialsTabProps) => {
  const { data, isLoading } = useSolutionDataContext();
  const { log } = useLogging();

  if (isLoading) {
    return <SolutionMaterialsLoading />;
  }

  const materials = data?.materials || [];

  if (materials.length === 0) {
    log("Nenhum material encontrado para a solução", { solutionId });
    return <SolutionMaterialsEmpty />;
  }

  log("Renderizando materiais da solução", { solutionId, count: materials.length });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-textPrimary">Materiais de Apoio</h3>
        <p className="text-textSecondary">
          Baixe os materiais necessários para implementar esta solução.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((material) => (
          <SolutionMaterialCard key={material.id} material={material} />
        ))}
      </div>
    </div>
  );
};
