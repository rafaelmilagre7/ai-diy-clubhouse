
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

export const useSolutionSave = (id: string | undefined, setSolution: (solution: any) => void) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const onSubmit = async (values: SolutionFormValues) => {
    setSaving(true);
    
    try {
      if (id) {
        // Update existing solution
        const { data, error } = await supabase
          .from("solutions")
          .update({
            title: values.title,
            description: values.description,
            category: values.category,
            difficulty: values.difficulty,
            thumbnail_url: values.thumbnail_url,
            published: values.published,
            slug: values.slug,
            updated_at: new Date().toISOString()
          } as any)
          .eq("id", id as any)
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          setSolution(data);
          toast({
            title: "Solução atualizada",
            description: "As alterações foram salvas com sucesso."
          });
        }
      } else {
        // Create new solution
        const { data, error } = await supabase
          .from("solutions")
          .insert({
            title: values.title,
            description: values.description,
            category: values.category,
            difficulty: values.difficulty,
            thumbnail_url: values.thumbnail_url,
            published: values.published,
            slug: values.slug,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any)
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          setSolution(data);
          toast({
            title: "Solução criada",
            description: "A nova solução foi criada com sucesso."
          });
          
          // Navigate to edit the newly created solution
          navigate(`/admin/solutions/${(data as any).id}`);
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar solução:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a solução.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  return {
    saving,
    onSubmit
  };
};
