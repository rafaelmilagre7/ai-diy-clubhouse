
import { useState } from 'react';
import { Tool } from '@/types/toolTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useToolForm = (toolId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (toolId === 'new') {
        // Create new tool
        const { data: newTool, error } = await supabase
          .from('tools')
          .insert([{
            name: data.name,
            description: data.description,
            category: data.category,
            url: data.official_url,
            logo_url: data.logo_url,
            is_active: data.status,
            features: data.features || [],
            pricing_info: data.pricing_info || null,
            benefit_title: data.has_member_benefit ? data.benefit_title : null,
            benefit_description: data.has_member_benefit ? data.benefit_description : null,
            benefit_url: data.has_member_benefit ? data.benefit_link : null,
            benefit_type: data.has_member_benefit ? data.benefit_type : null,
          }])
          .select()
          .single();

        if (error) throw error;
        
        toast.success('Ferramenta criada com sucesso!');
        return { success: true, data: newTool };
      } else {
        // Update existing tool
        const { data: updatedTool, error } = await supabase
          .from('tools')
          .update({
            name: data.name,
            description: data.description,
            category: data.category,
            url: data.official_url,
            logo_url: data.logo_url,
            is_active: data.status,
            features: data.features || [],
            pricing_info: data.pricing_info || null,
            benefit_title: data.has_member_benefit ? data.benefit_title : null,
            benefit_description: data.has_member_benefit ? data.benefit_description : null,
            benefit_url: data.has_member_benefit ? data.benefit_link : null,
            benefit_type: data.has_member_benefit ? data.benefit_type : null,
          })
          .eq('id', toolId)
          .select()
          .single();

        if (error) throw error;
        
        toast.success('Ferramenta atualizada com sucesso!');
        return { success: true, data: updatedTool };
      }
    } catch (error: any) {
      console.error('Erro ao salvar ferramenta:', error);
      toast.error(error.message || 'Erro ao salvar ferramenta');
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
