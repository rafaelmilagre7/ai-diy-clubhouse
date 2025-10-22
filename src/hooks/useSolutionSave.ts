
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { slugify } from "@/utils/slugify";

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
      
      // Gerar um slug único a partir do título com timestamp
      const slug = values.slug || slugify(values.title, true);
      
      // Validar o valor da dificuldade antes de salvar
      if (values.difficulty !== "easy" && values.difficulty !== "medium" && values.difficulty !== "advanced") {
        console.error(`Valor inválido para dificuldade: "${values.difficulty}". Deve ser "easy", "medium" ou "advanced"`);
        toast({
          title: "Erro na validação",
          description: `Valor de dificuldade inválido: "${values.difficulty}". Valores aceitos: "easy", "medium", "advanced"`,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
      
      // Preparar dados para salvar - CORRIGIDO: usar valores corretos para o banco
      const solutionData = {
        title: values.title,
        description: values.description,
        category: values.category, // Manter os valores em português
        difficulty: values.difficulty as "easy" | "medium" | "advanced",
        slug: slug,
        thumbnail_url: values.thumbnail_url || null,
        published: values.published || false,
        updated_at: new Date().toISOString(),
      };
      
      // Tentar salvar com retry para contornar possíveis erros de RLS
      let retryCount = 0;
      let success = false;
      let lastError: any = null;
      
      while (retryCount < 3 && !success) {
        try {
          if (id) {
            // Atualizar solução existente
            const response = await supabase
              .from("solutions")
              .update(solutionData)
              .eq("id", id)
              .select();
            
            if (response.error) {
              throw response.error;
            }
            
            if (response.data && response.data.length > 0) {
              setSolution(response.data[0] as Solution);
              success = true;
            }
          } else {
            // Criar nova solução
            const newSolution = {
              ...solutionData,
              created_at: new Date().toISOString(),
            };
            
            // Se houver erro de duplicação de slug, adicionar um timestamp adicional
            if (retryCount > 0) {
              newSolution.slug = `${slug}-${new Date().getTime() + retryCount}`;
            }
            
            const response = await supabase
              .from("solutions")
              .insert(newSolution)
              .select();
            
            if (response.error) {
              throw response.error;
            }
            
            if (response.data && response.data.length > 0) {
              setSolution(response.data[0] as Solution);
              navigate(`/admin/solutions/${response.data[0].id}`);
              success = true;
            }
          }
        } catch (error: any) {
          lastError = error;
          retryCount++;
          
          // Logar detalhes do erro para depuração
          console.error("Tentativa " + retryCount + " falhou:", error);
          
          // Se for um erro de duplicação de slug, tente novamente com um slug diferente
          if (error.message?.includes('duplicate key value violates unique constraint') && 
              error.message?.includes('solutions_slug_key')) {
            // Próxima iteração usará um slug diferente
            continue;
          }
          
          // Se for um erro com a enum de dificuldade, mostre um erro específico
          if (error.message?.includes('invalid input value for enum difficulty_level')) {
            toast({
              title: "Erro com valor de dificuldade",
              description: `Valor de dificuldade inválido: ${values.difficulty}. Valores aceitos: "easy", "medium", "advanced"`,
              variant: "destructive",
            });
            break;
          }
          
          // Se não for um erro de política ou recursão ou duplicação, não tente novamente
          if (!error.message?.includes('infinite recursion') && 
              !error.message?.includes('policy') && 
              !error.code?.includes('42P17')) {
            break;
          }
          
          // Pequena pausa antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (success) {
        toast({
          title: id ? "Solução atualizada" : "Solução criada",
          description: id ? "As alterações foram salvas com sucesso." : "A nova solução foi criada com sucesso.",
        });
      } else {
        throw lastError || new Error("Não foi possível salvar a solução após várias tentativas");
      }
    } catch (error: any) {
      console.error("Erro ao salvar solução:", error);
      
      // Mensagem de erro mais amigável baseada no tipo de erro
      if (error.message?.includes('duplicate key value violates unique constraint') && 
          error.message?.includes('solutions_slug_key')) {
        toast({
          title: "Erro ao salvar solução",
          description: "Já existe uma solução com este slug. Tente modificar o título para criar um slug único.",
          variant: "destructive",
        });
      } else if (error.message?.includes('invalid input value for enum difficulty_level')) {
        toast({
          title: "Erro ao salvar solução",
          description: `Valor de dificuldade inválido. Valores aceitos: "easy", "medium", "advanced"`,
          variant: "destructive",
        });
      } else if (error.message?.includes('infinite recursion') || 
          error.message?.includes('policy') || 
          error.code === '42P17') {
        toast({
          title: "Erro ao salvar solução",
          description: "Ocorreu um problema com as permissões de acesso. Estamos trabalhando para resolver isso. Tente novamente em alguns instantes.",
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
