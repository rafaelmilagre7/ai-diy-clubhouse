
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { slugify } from "@/utils/solutionUtils";

export const useSolutionSave = (
  id: string | undefined,
  setSolution: (solution: Solution) => void
) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const onSubmit = async (values: SolutionFormValues, user: any) => {
    try {
      setSaving(true);
      
      // Gerar um slug a partir do título se não for fornecido
      const slug = values.slug || slugify(values.title);
      
      // Preparar dados para salvar, incluindo campos obrigatórios
      const solutionData = {
        title: values.title,
        description: values.description,
        category: values.category,
        difficulty: values.difficulty,
        slug: slug,
        thumbnail_url: values.thumbnail_url || null,
        published: values.published,
        updated_at: new Date().toISOString(),
      };
      
      if (id) {
        const { error } = await supabase
          .from("solutions")
          .update(solutionData)
          .eq("id", id);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Solução atualizada",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        const newSolution = {
          ...solutionData,
          created_at: new Date().toISOString(),
        };
        
        const { data, error } = await supabase
          .from("solutions")
          .insert(newSolution)
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        setSolution(data as Solution);
        
        toast({
          title: "Solução criada",
          description: "A nova solução foi criada com sucesso.",
        });
        
        navigate(`/admin/solutions/${data.id}`);
      }
    } catch (error: any) {
      console.error("Error saving solution:", error);
      toast({
        title: "Erro ao salvar solução",
        description: error.message || "Ocorreu um erro ao tentar salvar a solução.",
        variant: "destructive",
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
