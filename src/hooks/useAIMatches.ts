import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNetworkingAnalytics } from '@/hooks/useNetworkingAnalytics';

export const useAIMatches = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { logEvent } = useNetworkingAnalytics();

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
        // Log evento de sucesso
        logEvent.mutate({
          event_type: 'match_generated',
          event_data: { 
            matches_count: data.matches_generated || 0,
            user_id: userId 
          }
        });

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