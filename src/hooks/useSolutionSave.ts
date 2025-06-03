
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase, Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { createUniqueSlug } from "@/utils/solutionUtils";
import { useAuth } from "@/contexts/auth";

export const useSolutionSave = (id: string | undefined, setSolution: (solution: Solution) => void) => {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const onSubmit = async (values: SolutionFormValues): Promise<void> => {
    try {
      setSaving(true);
      
      if (id) {
        // Atualizar solução existente
        const { data, error } = await supabase
          .from("solutions")
          .update({
            title: values.title,
            description: values.description,
            category: values.category,
            difficulty: values.difficulty,
            thumbnail_url: values.thumbnail_url,
            published: values.published,
            slug: values.slug || createUniqueSlug(values.title),
            updated_at: new Date().toISOString()
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        setSolution(data as Solution);
        console.log("Solução atualizada:", data);
        
        toast({
          title: "Solução atualizada",
          description: "As alterações foram salvas com sucesso."
        });
      } else {
        // Criar nova solução
        const newSolution = {
          title: values.title,
          description: values.description,
          category: values.category,
          difficulty: values.difficulty,
          thumbnail_url: values.thumbnail_url,
          published: values.published,
          slug: values.slug || createUniqueSlug(values.title),
          author_id: user?.id
        };

        const { data, error } = await supabase
          .from("solutions")
          .insert(newSolution)
          .select()
          .single();

        if (error) throw error;

        setSolution(data as Solution);
        console.log("Nova solução criada:", data);
        
        toast({
          title: "Solução criada",
          description: "A solução foi criada com sucesso."
        });

        // Redirecionar para edição da nova solução
        navigate(`/admin/solutions/${data.id}`, { replace: true });
      }
    } catch (error: any) {
      console.error("Erro ao salvar solução:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a solução.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    onSubmit
  };
};
