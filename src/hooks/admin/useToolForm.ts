
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { ToolFormValues } from '@/components/admin/tools/types/toolFormTypes';

export const useToolForm = (toolId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: ToolFormValues): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      console.log('Salvando ferramenta:', data);

      // Garantir que todos os campos esperados estejam presentes
      const toolData = {
        name: data.name,
        description: data.description,
        official_url: data.official_url,
        category: data.category,
        status: data.status,
        logo_url: data.logo_url,
        tags: data.tags || [],
        video_tutorials: data.video_tutorials || [],
        has_member_benefit: data.has_member_benefit || false,
        benefit_type: data.benefit_type || null,
        benefit_title: data.benefit_title || null,
        benefit_description: data.benefit_description || null,
        benefit_link: data.benefit_link || null,
        benefit_badge_url: data.benefit_badge_url || null,
        updated_at: new Date().toISOString()
      };

      console.log('Dados formatados para salvar:', toolData);

      let response;

      // Verifica se é uma nova ferramenta ou atualização
      if (toolId === 'new') {
        // Adicionando created_at para novas ferramentas
        const newToolData = {
          ...toolData,
          created_at: new Date().toISOString()
        };

        response = await supabase
          .from('tools')
          .insert(newToolData as any)
          .select();
      } else {
        // Atualização de ferramenta existente
        response = await supabase
          .from('tools')
          .update(toolData as any)
          .eq('id', toolId as any)
          .select();
      }

      const { error, data: responseData } = response;

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Resposta do Supabase:', responseData);

      toast({
        title: toolId === 'new' ? "Ferramenta criada" : "Ferramenta atualizada",
        description: toolId === 'new' 
          ? "A nova ferramenta foi adicionada com sucesso" 
          : "As alterações foram salvas com sucesso",
      });

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
