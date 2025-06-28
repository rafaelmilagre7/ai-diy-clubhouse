
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export function useSaveResources() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const saveResources = async (solutionId: string | null, values: any) => {
    if (!solutionId) {
      toast({
        title: "Salve a solução primeiro",
        description: "Você precisa salvar as informações básicas antes de adicionar recursos.",
        variant: "destructive",
      });
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Simplified implementation without deep types
      const resourcesData = { overview: values.overview };
      
      // Simple resource handling
      const { error: saveError } = await supabase
        .from('solution_resources')
        .upsert({
          solution_id: solutionId,
          type: 'resources',
          name: 'Solution Resources',
          url: JSON.stringify(resourcesData),
          updated_at: new Date().toISOString()
        });
      
      if (saveError) throw saveError;
      
      toast({
        title: "Recursos salvos",
        description: "Os recursos da solução foram salvos com sucesso.",
      });
      
      return true;
    } catch (saveError: any) {
      console.error('Error saving resources:', saveError);
      setError(saveError.message || 'Erro ao salvar recursos');
      toast({
        title: "Erro ao salvar recursos",
        description: "Ocorreu um erro ao tentar salvar os recursos da solução.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  return {
    saveResources,
    isSaving,
    error,
    setError
  };
}
