
import { toast } from "@/hooks/use-toast";
import { Module } from "../BlockTypes";

/**
 * Validates the module data before saving
 */
export const validateModule = (title: string): boolean => {
  if (!title.trim()) {
    toast({
      title: "Título obrigatório",
      description: "O módulo precisa ter um título.",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};

/**
 * Creates the updated module object for saving
 */
export const createUpdatedModule = (
  editedModule: Module, 
  title: string
): Module => {
  return {
    ...editedModule,
    title,
  };
};
