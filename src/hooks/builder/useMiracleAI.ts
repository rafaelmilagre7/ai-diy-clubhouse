import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Question {
  category: string;
  question: string;
  why_important: string;
}

export const useMiracleAI = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);

  const analyzeIdea = async (idea: string): Promise<Question[] | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-idea', {
        body: { idea }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Limite de requisições atingido. Aguarde alguns instantes.');
        } else if (error.message?.includes('402')) {
          toast.error('Créditos insuficientes. Entre em contato com o suporte.');
        } else {
          toast.error('Erro ao analisar ideia. Tente novamente.');
        }
        return null;
      }

      if (!data?.questions || data.questions.length === 0) {
        toast.error('Não foi possível gerar perguntas. Tente novamente.');
        return null;
      }

      setQuestions(data.questions);
      return data.questions;
    } catch (error) {
      console.error('[MIRACLE] Erro ao analisar:', error);
      toast.error('Erro ao analisar ideia');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSolution = async (
    idea: string,
    answers: Array<{ question: string; answer: string }>
  ): Promise<any | null> => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar autenticado');
        return null;
      }

      const { data, error } = await supabase.functions.invoke('generate-miracle-solution', {
        body: {
          idea,
          userId: user.id,
          answers
        }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Limite mensal atingido');
        } else if (error.message?.includes('402')) {
          toast.error('Créditos insuficientes');
        } else {
          toast.error('Erro ao gerar solução');
        }
        return null;
      }

      if (!data?.solution) {
        toast.error('Solução não gerada corretamente');
        return null;
      }

      toast.success('Solução Miracle AI gerada com sucesso! 🎉');
      return data.solution;
    } catch (error) {
      console.error('[MIRACLE] Erro ao gerar:', error);
      toast.error('Erro ao gerar solução');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSolution = async (solution: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      // Solução já foi salva automaticamente no banco durante geração
      // Apenas mostrar feedback positivo
      toast.success('Solução salva no histórico com sucesso! 🎉');
    } catch (error) {
      console.error('[MIRACLE] Erro ao salvar solução:', error);
      toast.error('Erro ao salvar solução');
    }
  };

  const discardSolution = () => {
    toast.info('Solução descartada (crédito já foi consumido)');
  };

  return {
    analyzeIdea,
    generateSolution,
    saveSolution,
    discardSolution,
    isAnalyzing,
    isGenerating,
    questions,
  };
};
