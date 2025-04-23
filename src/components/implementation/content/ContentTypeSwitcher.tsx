
import React from "react";
import { Module } from "@/lib/supabase";
import { ModuleContentMaterials } from "./ModuleContentMaterials";
import { ModuleContentVideos } from "./ModuleContentVideos";
import { ModuleContentTools } from "./ModuleContentTools";
import { ModuleContentChecklist } from "./ModuleContentChecklist";
import { ModuleContentFAQ } from "./ModuleContentFAQ";

interface ContentTypeSwitcherProps {
  contentType: string;
  module: Module;
}

export const ContentTypeSwitcher: React.FC<ContentTypeSwitcherProps> = ({
  contentType,
  module
}) => {
  console.log("ContentTypeSwitcher render:", { contentType, moduleId: module.id });
  
  // Montando componentes de acordo com o tipo de conteúdo
  return (
    <>
      {/* Sempre mostrar vídeos se disponíveis */}
      <ModuleContentVideos module={module} />

      {/* Mostrar materiais se o tipo for materials ou preparation */}
      {(contentType === "materials" || contentType === "preparation") && (
        <ModuleContentMaterials module={module} />
      )}

      {/* Mostrar ferramentas se o tipo for tools */}
      {(contentType === "tools") && (
        <ModuleContentTools module={module} />
      )}

      {/* Mostrar checklist se o tipo for checklist ou verification */}
      {(contentType === "checklist" || contentType === "verification") && (
        <ModuleContentChecklist module={module} />
      )}

      {/* Mostrar FAQ se o tipo for faq */}
      {contentType === "faq" && (
        <ModuleContentFAQ module={module} />
      )}
    </>
  );
};
