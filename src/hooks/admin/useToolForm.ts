
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { ToolFormValues } from '@/components/admin/tools/types/toolFormTypes';

export const useToolForm = (toolId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: ToolFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Salvando ferramenta:', data);

      const { error } = await supabase
        .from('tools')
        .update({
          name: data.name,
          description: data.description,
          official_url: data.official_url,
          category: data.category,
          status: data.status,
          logo_url: data.logo_url,
          tags: data.tags,
          video_tutorials: data.video_tutorials,
          has_member_benefit: data.has_member_benefit,
          benefit_type: data.benefit_type,
          benefit_title: data.benefit_title,
          benefit_description: data.benefit_description,
          benefit_link: data.benefit_link,
          benefit_badge_url: data.benefit_badge_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', toolId);

      if (error) throw error;

      toast({
        title: "Ferramenta atualizada",
        description: "As alterações foram salvas com sucesso",
      });

      // Retornar true para indicar sucesso
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar ferramenta:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar as alterações",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
