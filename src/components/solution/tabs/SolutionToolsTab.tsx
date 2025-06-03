
import React from "react";
import { SolutionToolCard } from "../tools/SolutionToolCard";
import { SolutionToolsLoading } from "../tools/SolutionToolsLoading";
import { SolutionToolsEmpty } from "../tools/SolutionToolsEmpty";
import { useSolutionDataContext } from "@/contexts/SolutionDataContext";
import { useLogging } from "@/hooks/useLogging";

interface SolutionToolsTabProps {
  solutionId: string;
}

export const SolutionToolsTab = ({ solutionId }: SolutionToolsTabProps) => {
  const { data, isLoading } = useSolutionDataContext();
  const { log } = useLogging();

  if (isLoading) {
    return <SolutionToolsLoading />;
  }

  const tools = data?.tools || [];

  if (tools.length === 0) {
    log("Nenhuma ferramenta encontrada para a solução", { solutionId });
    return <SolutionToolsEmpty />;
  }

  log("Renderizando ferramentas da solução", { solutionId, count: tools.length });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-textPrimary">Ferramentas Necessárias</h3>
        <p className="text-textSecondary">
          Para implementar esta solução, você precisará das seguintes ferramentas:
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <SolutionToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};
