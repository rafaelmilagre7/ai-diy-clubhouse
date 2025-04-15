
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Templates for the different types of resources
export const TEMPLATES = {
  materials: `[
  {
    "title": "Guia de Implementação",
    "description": "Guia completo em PDF para a implementação da solução.",
    "url": "https://example.com/guia.pdf",
    "type": "pdf"
  },
  {
    "title": "Template de Planilha",
    "description": "Modelo de planilha para acompanhamento da solução.",
    "url": "https://example.com/template.xlsx",
    "type": "spreadsheet"
  }
]`,

  external_links: `[
  {
    "title": "Documentação Oficial",
    "description": "Link para a documentação oficial da ferramenta.",
    "url": "https://example.com/docs"
  },
  {
    "title": "Comunidade de Suporte",
    "description": "Fórum da comunidade para tirar dúvidas.",
    "url": "https://example.com/forum"
  }
]`,

  faq: `[
  {
    "question": "Quanto tempo leva para ver resultados?",
    "answer": "Você deve começar a ver os primeiros resultados em cerca de 2 semanas após a implementação completa."
  },
  {
    "question": "É necessário conhecimento técnico?",
    "answer": "Não é necessário conhecimento técnico avançado, mas familiaridade básica com as ferramentas mencionadas é recomendada."
  }
]`
};

// Definição do schema para validação do formulário
export const resourceFormSchema = z.object({
  overview: z.string().optional(),
  materials: z.string().optional(),
  external_links: z.string().optional(),
  faq: z.string().optional(),
});

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;
export interface ModuleContent {
  blocks?: any[];
  [key: string]: any;
}

export function useResourcesFormData(solutionId: string | null) {
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
      external_links: TEMPLATES.external_links,
      faq: TEMPLATES.faq
    }
  });
  
  // Carregar recursos existentes
  useEffect(() => {
    if (!solutionId) return;
    
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
            // Parse the URL field as it contains our JSON data
            const resourceData = JSON.parse(data.url);
            form.reset({
              overview: resourceData.overview || '',
              materials: resourceData.materials ? JSON.stringify(resourceData.materials, null, 2) : TEMPLATES.materials,
              external_links: resourceData.external_links ? JSON.stringify(resourceData.external_links, null, 2) : TEMPLATES.external_links,
              faq: resourceData.faq ? JSON.stringify(resourceData.faq, null, 2) : TEMPLATES.faq
            });
          } catch (parseError) {
            console.error('Error parsing resource data:', parseError);
            form.reset({
              overview: '',
              materials: TEMPLATES.materials,
              external_links: TEMPLATES.external_links,
              faq: TEMPLATES.faq
            });
          }
        }
      } catch (fetchError) {
        console.error('Error fetching resources:', fetchError);
        setError('Erro ao carregar recursos. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, [solutionId, form]);
  
  // Fetch módulos para o resumo de conteúdo
  useEffect(() => {
    if (!solutionId) return;
    
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
    
    fetchModules();
  }, [solutionId]);
  
  // Função para salvar todos os recursos
  const handleSaveResources = async () => {
    if (!solutionId) {
      toast({
        title: "Salve a solução primeiro",
        description: "Você precisa salvar as informações básicas antes de adicionar recursos.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const values = form.getValues();
      
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
    form,
    modules,
    error,
    isLoading,
    isSaving,
    setError,
    handleSaveResources
  };
}
