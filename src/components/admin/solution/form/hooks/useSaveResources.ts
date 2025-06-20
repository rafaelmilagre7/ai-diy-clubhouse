
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ResourceFormValues } from "../utils/resourceFormSchema";

export function useSaveResources() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const saveResources = async (solutionId: string | null, values: ResourceFormValues) => {
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
      
      try {
        if (values.faq) {
          resourcesData.faq = JSON.parse(values.faq);
        }
      } catch (parseError) {
        throw new Error('Erro ao processar FAQ. Verifique o formato JSON.');
      }
      
      // Check if resource already exists
      const { data: existingResource, error: queryError } = await supabase
        .from('solution_resources')
        .select('id')
        .eq('solution_id', solutionId as any)
        .eq('type', 'resources' as any)
        .single();
      
      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }
      
      if ((existingResource as any)?.id) {
        // Update existing resource
        const { error: updateError } = await supabase
          .from('solution_resources')
          .update({
            url: JSON.stringify(resourcesData),
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', (existingResource as any).id);
        
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
          } as any);
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Recursos salvos",
        description: "Os recursos da solução foram salvos com sucesso.",
      });
      
      return true;
    } catch (saveError: any) {
      console.error('Error saving resources:', saveError);
      setError(saveError.message || 'Erro ao salvar recursos. Por favor, tente novamente.');
      toast({
        title: "Erro ao salvar recursos",
        description: saveError.message || "Ocorreu um erro ao tentar salvar os recursos da solução.",
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
