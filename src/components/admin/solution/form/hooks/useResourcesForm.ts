
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resourceFormSchema, ResourceFormValues } from "../utils/resourceFormSchema";
import { TEMPLATES } from "../utils/resourceTemplates";
import { ModuleContent } from "../types/ModuleTypes";

export function useResourcesForm(solutionId: string | null) {
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      overview: '',
      materials: TEMPLATES.materials,
      external_links: TEMPLATES.external_links
    }
  });
  
  // Fetch resources when solution ID changes
  useEffect(() => {
    if (!solutionId) return;
    fetchResources();
  }, [solutionId]);
  
  // Fetch modules for content summary
  useEffect(() => {
    if (!solutionId) return;
    fetchModules();
  }, [solutionId]);
  
  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('solution_resources')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('type', 'resources')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        try {
          const resourceData = JSON.parse(data.url);
          form.reset({
            overview: resourceData.overview || '',
            materials: resourceData.materials ? JSON.stringify(resourceData.materials, null, 2) : TEMPLATES.materials,
            external_links: resourceData.external_links ? JSON.stringify(resourceData.external_links, null, 2) : TEMPLATES.external_links
          });
        } catch (parseError) {
          console.error('Error parsing resource data:', parseError);
          resetFormToDefaults();
        }
      }
    } catch (fetchError) {
      console.error('Error fetching resources:', fetchError);
      setError('Erro ao carregar recursos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetFormToDefaults = () => {
    form.reset({
      overview: '',
      materials: TEMPLATES.materials,
      external_links: TEMPLATES.external_links
    });
  };
  
  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('solution_id', solutionId)
        .order('module_order', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Filter modules with valid content structure
      const validModules = data.filter(module => {
        if (!module.content) return false;
        
        try {
          // Safely parse content regardless of its current format
          let parsedContent: ModuleContent;
          
          if (typeof module.content === 'string') {
            parsedContent = JSON.parse(module.content);
          } else {
            parsedContent = module.content as ModuleContent;
          }
          
          // Check if it has blocks array and it's not empty
          return parsedContent && 
                Array.isArray(parsedContent.blocks) && 
                parsedContent.blocks.length > 0;
        } catch (e) {
          console.error('Error parsing module content:', e);
          return false;
        }
      });
      
      setModules(validModules);
    } catch (fetchError) {
      console.error('Error fetching modules:', fetchError);
    }
  };

  return {
    form,
    modules,
    error,
    isLoading,
    isSaving,
    setError,
    setIsSaving
  };
}
