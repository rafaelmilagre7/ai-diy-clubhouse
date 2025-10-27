import { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAISolutionAccess } from './useAISolutionAccess';
import { isValidTitle, generateSmartTitle } from '@/utils/builderRecovery';

export const useAISolutionGenerator = () => {
  const { user } = useAuth();
  const { canGenerate, refetch: refetchUsage } = useAISolutionAccess();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSolution = async (idea: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para usar o Builder');
      return null;
    }

    if (!canGenerate) {
      toast.error('Você atingiu o limite mensal de gerações', {
        description: 'Aguarde até o próximo mês ou entre em contato para upgrade.'
      });
      return null;
    }

    if (idea.length < 30) {
      toast.error('Ideia muito curta', {
        description: 'Descreva sua ideia com pelo menos 30 caracteres.'
      });
      return null;
    }

    if (idea.length > 1000) {
      toast.error('Ideia muito longa', {
        description: 'Reduza para no máximo 1000 caracteres.'
      });
      return null;
    }

    setIsGenerating(true);
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('generate-builder-solution', {
        body: {
          idea: idea.trim(),
          userId: user.id,
          mode: 'quick' // 🆕 Modo quick por padrão
        }
      });

      const elapsedTime = Date.now() - startTime;

      if (error) {
        if (error.message.includes('Limite mensal')) {
          toast.error('Limite mensal atingido', {
            description: 'Você já usou todas as suas gerações deste mês.'
          });
        } else {
          toast.error('Erro ao gerar solução', {
            description: error.message || 'Tente novamente em instantes.'
          });
        }
        return null;
      }

      if (!data?.success) {
        toast.error('Erro ao processar solução', {
          description: data?.error || 'Resposta inesperada do servidor.'
        });
        return null;
      }

      // 🔍 VALIDAÇÃO FRONTEND DO TÍTULO
      if (data.solution && !isValidTitle(data.solution.title, idea)) {
        console.warn('[BUILDER-GENERATOR] ⚠️ Título inválido detectado no frontend:', data.solution.title);
        const smartTitle = generateSmartTitle(idea);
        
        // Corrigir no banco
        await supabase
          .from('ai_generated_solutions')
          .update({ title: smartTitle })
          .eq('id', data.solution.id);
        
        data.solution.title = smartTitle;
        console.log('[BUILDER-GENERATOR] ✅ Título corrigido para:', smartTitle);
      }

      // Atualizar contador de uso
      await refetchUsage();
      console.log('[BUILDER-GENERATOR] 🔄 Contador de uso atualizado');

      toast.success('Solução gerada com sucesso! 🎉', {
        description: `Tempo de processamento: ${(elapsedTime / 1000).toFixed(1)}s`
      });

      return data.solution;
    } catch (err: any) {
      console.error('Erro ao gerar solução:', err);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao gerar sua solução. Tente novamente.'
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateSolution,
    isGenerating
  };
};
