
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
        published: values.published,
        updated_at: new Date().toISOString(),
      };
      
      // Em vez de funções RPC que podem não existir, usamos operações diretas
      // mas com melhor tratamento de erro
      if (id) {
        // Atualizar solução existente
        const { error } = await supabase
          .from("solutions")
          .update(solutionData)
          .eq("id", id);
        
        if (error) {
          // Verificar se é um erro de recursão
          if (error.message && error.message.includes('infinite recursion')) {
            console.error("Erro de recursão detectado nas políticas RLS:", error);
            throw new Error("Problema de permissão: Recursão infinita nas políticas de segurança");
          }
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
        
        const { data, error } = await supabase
          .from("solutions")
          .insert(newSolution)
          .select()
          .single();
        
        if (error) {
          // Verificar se é um erro de recursão
          if (error.message && error.message.includes('infinite recursion')) {
            console.error("Erro de recursão detectado nas políticas RLS:", error);
            throw new Error("Problema de permissão: Recursão infinita nas políticas de segurança");
          }
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
      
      // Mensagem de erro mais específica para problemas de recursão
      if (error.message && error.message.includes('recursão infinita') || 
          error.message && error.message.includes('infinite recursion')) {
        toast({
          title: "Erro de permissão",
          description: "Problema nas políticas de segurança detectado. Entre em contato com o administrador.",
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
