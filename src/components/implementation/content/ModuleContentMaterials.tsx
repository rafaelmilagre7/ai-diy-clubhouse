
import React from "react";
import { Module } from "@/lib/supabase";
import { useMaterialsData } from "@/hooks/implementation/useMaterialsData";
import { MaterialsLoading } from "./materials/MaterialsLoading";
import { MaterialsEmptyState } from "./materials/MaterialsEmptyState";
import { MaterialItem } from "./materials/MaterialItem";
import { useLogging } from "@/hooks/useLogging";

interface ModuleContentMaterialsProps {
  module: Module;
}

export const ModuleContentMaterials: React.FC<ModuleContentMaterialsProps> = ({ module }) => {
  const { materials, loading } = useMaterialsData(module);
  const { log } = useLogging("ModuleContentMaterials");

  // Log para diagnóstico
  React.useEffect(() => {
    log("ModuleContentMaterials renderizado", { 
      module_id: module.id,
      materials_count: materials?.length || 0
    });
  }, [module.id, materials, log]);

  if (loading) {
    return <MaterialsLoading />;
  }

  if (!materials || materials.length === 0) {
    return <MaterialsEmptyState />;
  }

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-semibold">Materiais de Apoio</h3>
      <p className="text-muted-foreground">
        Baixe os materiais necessários para implementar esta solução:
      </p>
      
      <div className="space-y-3 mt-4">
        {materials.map((material) => (
          <MaterialItem 
            key={material.id} 
            material={material}
          />
        ))}
      </div>
    </div>
  );
};
