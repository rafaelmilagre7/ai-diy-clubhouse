
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import { ResourceFormValues } from "../utils/resourceFormSchema";

export function useSaveResources() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToastModern();
  
  const saveResources = async (solutionId: string | null, values: ResourceFormValues) => {
    if (!solutionId) {
      showError("Salve a solução primeiro", "Você precisa salvar as informações básicas antes de adicionar recursos.");
      return false;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Parse JSON fields
      let resourcesData: any = { overview: values.overview };
      
      try {
        if (values.materials) {
          resourcesData.materials = JSON.parse(values.materials);
        }
      } catch (parseError) {
        throw new Error('Erro ao processar materiais. Verifique o formato JSON.');
      }
      
      try {
        if (values.external_links) {
          resourcesData.external_links = JSON.parse(values.external_links);
        }
      } catch (parseError) {
        throw new Error('Erro ao processar links externos. Verifique o formato JSON.');
      }
      
      
      // Check if resource already exists
      const { data: existingResource, error: queryError } = await supabase
        .from('solution_resources')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('type', 'resources')
        .single();
      
      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }
      
      if (existingResource) {
        // Update existing resource
        const { error: updateError } = await supabase
          .from('solution_resources')
          .update({
            url: JSON.stringify(resourcesData),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResource.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new resource
        const { error: insertError } = await supabase
          .from('solution_resources')
          .insert({
            solution_id: solutionId,
            type: 'resources',
            name: 'Solution Resources',
            url: JSON.stringify(resourcesData),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) throw insertError;
      }
      
      showSuccess("Recursos salvos", "Os recursos da solução foram salvos com sucesso.");
      
      return true;
    } catch (saveError: any) {
      console.error('Error saving resources:', saveError);
      setError(saveError.message || 'Erro ao salvar recursos. Por favor, tente novamente.');
      showError("Erro ao salvar recursos", saveError.message || "Ocorreu um erro ao tentar salvar os recursos da solução.");
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
