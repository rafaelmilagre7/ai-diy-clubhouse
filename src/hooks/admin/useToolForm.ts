
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { ToolFormValues } from '@/components/admin/tools/types/toolFormTypes';

export const useToolForm = (toolId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: ToolFormValues): Promise<{ success: boolean; data?: Tool }> => {
    try {
      setIsSubmitting(true);
      console.log('Salvando ferramenta:', { toolId, data });

      // Preparar dados para salvar
      const toolData = {
        name: data.name,
        description: data.description,
        official_url: data.official_url,
        category: data.category,
        status: data.status,
        logo_url: data.logo_url || null,
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

      if (toolId === 'new') {
        // Criar nova ferramenta
        const newToolData = {
          ...toolData,
          created_at: new Date().toISOString()
        };

        response = await supabase
          .from('tools')
          .insert(newToolData)
          .select()
          .single();
      } else {
        // Atualizar ferramenta existente
        response = await supabase
          .from('tools')
          .update(toolData)
          .eq('id', toolId)
          .select()
          .single();
      }

      const { error, data: responseData } = response;

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      if (!responseData) {
        throw new Error('Nenhum dado retornado após salvamento');
      }

      console.log('Ferramenta salva com sucesso:', responseData);

      toast({
        title: toolId === 'new' ? "Ferramenta criada" : "Ferramenta atualizada",
        description: toolId === 'new' 
          ? "A nova ferramenta foi adicionada com sucesso" 
          : "As alterações foram salvas com sucesso",
      });

      return { success: true, data: responseData as Tool };
    } catch (error: any) {
      console.error('Erro ao salvar ferramenta:', error);
      
      const errorMessage = error.message || "Ocorreu um erro ao salvar as alterações";
      
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
