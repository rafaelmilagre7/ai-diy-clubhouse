
import React from "react";
import { Module } from "@/lib/supabase";
import { ModuleContentTools } from "./ModuleContentTools";
import { ModuleContentMaterials } from "./ModuleContentMaterials";
import { ModuleContentVideos } from "./ModuleContentVideos";
import { ModuleContentChecklist } from "./ModuleContentChecklist";

interface ContentTypeSwitcherProps {
  contentType: string;
  module: Module;
}

/**
 * Component to render the appropriate content based on the content type
 */
export const ContentTypeSwitcher = ({ contentType, module }: ContentTypeSwitcherProps) => {
  // Render specific content based on module type
  switch (contentType) {
    case "tools":
      return <ModuleContentTools module={module} />;
    case "materials":
      return <ModuleContentMaterials module={module} />;
    case "videos":
      return <ModuleContentVideos module={module} />;
    case "checklist":
      return <ModuleContentChecklist module={module} />;
    default:
      return null;
  }
};
