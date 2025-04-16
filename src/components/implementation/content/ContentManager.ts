
import { Module } from "@/lib/supabase";

/**
 * Helper functions to manage content logic for module implementation
 */

/**
 * Determines if a module should auto-complete based on its type
 */
export const shouldAutoComplete = (module: Module): boolean => {
  return module.type === "landing" || module.type === "celebration";
};

/**
 * Determines if a module requires active user interaction before marking as complete
 */
export const requiresUserInteraction = (module: Module): boolean => {
  return !shouldAutoComplete(module);
};

/**
 * Generates a module title based on its position in the sequence
 */
export const getModulePositionLabel = (index: number, total: number): string => {
  if (index === 0) return "Início";
  if (index === total - 1) return "Conclusão";
  return `Módulo ${index + 1} de ${total}`;
};
