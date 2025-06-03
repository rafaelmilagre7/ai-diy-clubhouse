
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SolutionMaterialCard } from "../materials/SolutionMaterialCard";
import { SolutionMaterialsLoading } from "../materials/SolutionMaterialsLoading";
import { SolutionMaterialsEmpty } from "../materials/SolutionMaterialsEmpty";
import { useLogging } from "@/hooks/useLogging";

interface SolutionMaterialsTabProps {
  solutionId: string;
}

export const SolutionMaterialsTab = ({ solutionId }: SolutionMaterialsTabProps) => {
  const { log, logError } = useLogging();

  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['solution-materials', solutionId],
    queryFn: async () => {
      log("Buscando materiais da solução", { solutionId });
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .neq("type", "video") // Excluir vídeos (eles vão para a aba de vídeos)
        .order("created_at", { ascending: true });
      
      if (error) {
        logError("Erro ao buscar materiais", error);
        throw error;
      }
      
      log("Materiais encontrados", { count: data?.length || 0 });
      return data || [];
    },
    enabled: !!solutionId,
    staleTime: 5 * 60 * 1000
  });

  if (error) {
    logError("Erro ao exibir materiais", error);
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Erro ao carregar materiais desta solução.</p>
      </div>
    );
  }

  if (isLoading) {
    return <SolutionMaterialsLoading />;
  }

  if (!materials || materials.length === 0) {
    return <SolutionMaterialsEmpty />;
  }

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
