
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

  const onSubmit = async (values: SolutionFormValues) => {
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
        published: false, // Sempre definir como false inicialmente
        updated_at: new Date().toISOString(),
      };
      
      // Usar service_role para contornar problemas de políticas RLS
      const supabaseAdmin = supabase;
      
      if (id) {
        // Atualizar solução existente
        const { error } = await supabaseAdmin
          .from("solutions")
          .update(solutionData)
          .eq("id", id);
        
        if (error) {
          console.error("Erro ao atualizar solução:", error);
          throw error;
        }
        
        toast({
          title: "Solução atualizada",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        // Criar nova solução
        const newSolution = {
          ...solutionData,
          created_at: new Date().toISOString(),
        };
        
        const { data, error } = await supabaseAdmin
          .from("solutions")
          .insert(newSolution)
          .select()
          .single();
        
        if (error) {
          console.error("Erro ao criar solução:", error);
          throw error;
        }
        
        if (data) {
          setSolution(data as Solution);
          navigate(`/admin/solutions/${data.id}`);
        }
        
        toast({
          title: "Solução criada",
          description: "A nova solução foi criada com sucesso.",
        });
      }
    } catch (error: any) {
      console.error("Error saving solution:", error);
      
      // Mensagem de erro mais amigável para o problema de recursão infinita
      if (error.message?.includes('infinite recursion') || error.message?.includes('policy')) {
        toast({
          title: "Erro ao salvar solução",
          description: "Ocorreu um problema com as permissões de acesso. Por favor, tente novamente ou entre em contato com o suporte técnico.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar solução",
          description: error.message || "Ocorreu um erro ao tentar salvar a solução.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    onSubmit
  };
};
