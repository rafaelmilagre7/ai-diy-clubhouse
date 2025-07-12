import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAIMatches = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateMatches = async (userId: string) => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-matches', {
        body: { user_id: userId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Matches gerados com sucesso!",
          description: `${data.matches_generated} novos matches encontrados para você.`,
        });
        
        return data;
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao gerar matches:', error);
      toast({
        title: "Erro ao gerar matches",
        description: error.message || 'Tente novamente em alguns instantes.',
        variant: "destructive",
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