
import React from "react";
import { Module } from "@/lib/supabase";
import { ModuleContentMaterials } from "./ModuleContentMaterials";
import { ModuleContentVideos } from "./ModuleContentVideos";
import { ModuleContentTools } from "./ModuleContentTools";
import { ModuleContentChecklist } from "./ModuleContentChecklist";
import { ModuleContentFAQ } from "./ModuleContentFAQ";
import { useLogging } from "@/hooks/useLogging";

interface ContentTypeSwitcherProps {
  contentType: string;
  module: Module;
}

export const ContentTypeSwitcher: React.FC<ContentTypeSwitcherProps> = ({
  contentType,
  module
}) => {
  const { log } = useLogging("ContentTypeSwitcher");
  
  // Log para diagnóstico
  React.useEffect(() => {
    log("ContentTypeSwitcher renderizado", { 
      contentType, 
      moduleId: module.id 
    });
  }, [contentType, module.id, log]);
  
  // Montando componentes de acordo com o tipo de conteúdo
  return (
    <div className="space-y-8">
      {/* Sempre mostrar vídeos se o tipo for videos ou overview */}
      {(contentType === "videos" || contentType === "overview") && (
        <ModuleContentVideos module={module} />
      )}

      {/* Mostrar materiais se o tipo for materials ou preparation */}
      {(contentType === "materials" || contentType === "preparation") && (
        <ModuleContentMaterials module={module} />
      )}

      {/* Mostrar ferramentas se o tipo for tools */}
      {contentType === "tools" && (
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
    </div>
  );
};
