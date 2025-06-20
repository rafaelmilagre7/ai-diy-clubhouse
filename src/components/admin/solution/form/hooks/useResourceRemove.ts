
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import { Resource } from "../types/ResourceTypes";

export function useResourceRemove(
  setResources: Dispatch<SetStateAction<Resource[]>>,
  toast: any
) {
  const handleRemoveResource = async (id?: string, url?: string) => {
    if (!id) return;
    
    try {
      if (url) {
        const filePath = url.split("/").pop();
        if (filePath) {
          try {
            await supabase.storage
              .from("solution_files")
              .remove([`documents/${filePath}`]);
          } catch (storageError) {
            console.error("Error removing file from storage (might be external URL):", storageError);
          }
        }
      }
      
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id as any);
        
      if (error) throw error;
      
      setResources(prev => prev.filter(resource => resource.id !== id));
      
      toast({
        title: "Recurso removido",
        description: "O recurso foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao remover recurso:", error);
      toast({
        title: "Erro ao remover recurso",
        description: error.message || "Ocorreu um erro ao tentar remover o recurso.",
        variant: "destructive",
      });
    }
  };

  return { handleRemoveResource };
}
