import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAIMatches = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateMatches = async (userId: string) => {
    setIsGenerating(true);
    
    try {
      console.log('Chamando função generate-ai-matches para usuário:', userId);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-matches', {
        body: { user_id: userId }
      });

      if (error) {
        console.error('Erro ao chamar função:', error);
        throw new Error(error.message);
      }

      console.log('Resposta da função:', data);

      if (data.success) {
        toast({
          title: "Matches IA Gerados!",
          description: data.message,
          variant: "default"
        });
        return data;
      } else {
        throw new Error(data.error || 'Erro desconhecido ao gerar matches');
      }
    } catch (error) {
      console.error('Erro ao gerar matches IA:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar matches IA';
      
      toast({
        title: "Erro ao gerar matches",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateMatches,
    isGenerating
  };
};