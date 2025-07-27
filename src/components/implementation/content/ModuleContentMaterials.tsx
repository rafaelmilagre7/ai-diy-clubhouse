
import React from "react";
import { Module } from "@/lib/supabase";
import { useMaterialsData } from "@/hooks/implementation/useMaterialsData";
import { useFileDownload } from "@/hooks/implementation/useFileDownload";
import { MaterialsLoading } from "./materials/MaterialsLoading";
import { MaterialsEmptyState } from "./materials/MaterialsEmptyState";
import { MaterialItem } from "./materials/MaterialItem";
import { LinkItem } from "./materials/LinkItem";

interface ModuleContentMaterialsProps {
  module: Module;
}

export const ModuleContentMaterials: React.FC<ModuleContentMaterialsProps> = ({ module }) => {
  const { materials, externalLinks, loading } = useMaterialsData(module);
  const { handleDownload } = useFileDownload();

  if (loading) {
    return <MaterialsLoading />;
  }

  if (materials.length === 0 && externalLinks.length === 0) {
    return <MaterialsEmptyState />;
  }

  return (
    <div className="space-y-6 mt-8">
      {materials.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Materiais de Apoio</h3>
          <p className="text-muted-foreground">
            Baixe os materiais necessários para implementar esta solução:
          </p>
          
          <div className="space-y-3 mt-4">
            {materials.map((material) => (
              <MaterialItem 
                key={material.id} 
                material={material} 
                onDownload={handleDownload} 
              />
            ))}
          </div>
        </div>
      )}

      {externalLinks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Links Auxiliares</h3>
          <p className="text-muted-foreground">
            Acesse recursos externos úteis para esta solução:
          </p>
          
          <div className="space-y-3 mt-4">
            {externalLinks.map((link, index) => (
              <LinkItem 
                key={`${link.url}-${index}`} 
                link={link} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
