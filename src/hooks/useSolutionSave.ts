
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { Solution } from "@/types/supabaseTypes";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

export const useSolutionSave = (
  id: string | undefined, 
  setSolution: (solution: Solution) => void
) => {
  const [saving, setSaving] = useState(false);
  const { log, logError } = useLogging("useSolutionSave");
  
  const onSubmit = async (values: SolutionFormValues) => {
    if (saving) return Promise.reject(new Error("Já está salvando"));
    
    setSaving(true);
    log("Iniciando salvamento de solução", { id, values });
    
    try {
      const formData = {
        ...values,
        updated_at: new Date().toISOString()
      };
      
      let response;
      
      if (id) {
        // Atualizar solução existente
        response = await supabase
          .from("solutions")
          .update(formData)
          .eq("id", id)
          .select()
          .single();
      } else {
        // Criar nova solução
        response = await supabase
          .from("solutions")
          .insert([formData])
          .select()
          .single();
      }
      
      if (response.error) {
        throw response.error;
      }
      
      log("Solução salva com sucesso", { id: response.data?.id });
      
      // Atualizar os dados da solução no contexto
      setSolution(response.data as Solution);
      
      toast.success("Solução salva com sucesso");
      setSaving(false);
      return response.data;
    } catch (error) {
      logError("Exceção ao salvar solução", { error });
      toast.error("Erro ao salvar solução");
      setSaving(false);
      throw error;
    }
  };
  
  return { saving, onSubmit };
};
