
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SolutionModuleCard } from "../modules/SolutionModuleCard";
import { SolutionModulesLoading } from "../modules/SolutionModulesLoading";
import { SolutionModulesEmpty } from "../modules/SolutionModulesEmpty";
import { useLogging } from "@/hooks/useLogging";

interface SolutionModulesTabProps {
  solutionId: string;
}

export const SolutionModulesTab = ({ solutionId }: SolutionModulesTabProps) => {
  const { log, logError } = useLogging();

  const { data: modules, isLoading, error } = useQuery({
    queryKey: ['solution-modules', solutionId],
    queryFn: async () => {
      log("Buscando módulos da solução", { solutionId });
      
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("solution_id", solutionId)
        .order("module_order", { ascending: true });
      
      if (error) {
        logError("Erro ao buscar módulos", error);
        throw error;
      }
      
      log("Módulos encontrados", { count: data?.length || 0 });
      return data || [];
    },
    enabled: !!solutionId,
    staleTime: 5 * 60 * 1000
  });

  if (error) {
    logError("Erro ao exibir módulos", error);
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Erro ao carregar módulos desta solução.</p>
      </div>
    );
  }

  if (isLoading) {
    return <SolutionModulesLoading />;
  }

  if (!modules || modules.length === 0) {
    return <SolutionModulesEmpty />;
  }

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
