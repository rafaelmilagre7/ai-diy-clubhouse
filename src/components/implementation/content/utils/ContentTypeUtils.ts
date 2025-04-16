
import { Module } from "@/lib/supabase";

/**
 * Determine the content type based on module type
 */
export const getContentType = (module: Module): string => {
  const type = module.type;
  
  // Map module types to content types
  switch (type) {
    case "preparation":
      return "tools";
    case "implementation":
      return "materials";
    case "verification":
      return "checklist";
    case "results":
      return "videos";
    default:
      return "text";
  }
};
