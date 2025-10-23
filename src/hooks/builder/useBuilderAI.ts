import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Question {
  category: string;
  question: string;
  why_important: string;
}

export const useBuilderAI = () => {
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
      console.error('[BUILDER] Erro ao analisar:', error);
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

      const { data, error } = await supabase.functions.invoke('generate-builder-solution', {
        body: {
          idea,
          userId: user.id,
          answers
        }
      });

      console.log('[BUILDER-HOOK] 📦 Resposta raw da edge function:', {
        hasData: !!data,
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        errorMessage: error?.message,
        errorDetails: error
      });

      if (error) {
        console.error('[BUILDER-HOOK] ❌ Erro completo:', error);
        
        // 🔧 FASE 3: Mostrar mensagem descritiva do backend se disponível
        const errorMessage = error.message || 'Erro desconhecido';
        
        if (error.message?.includes('429')) {
          toast.error('Limite mensal atingido');
        } else if (error.message?.includes('402')) {
          toast.error('Créditos insuficientes');
        } else if (error.message?.includes('TIMEOUT') || error.message?.includes('408')) {
          toast.error('Geração demorou muito. Verifique seu histórico ou tente novamente.');
        } else {
          toast.error(`Erro ao gerar solução: ${errorMessage}`);
        }
        return null;
      }

      // Log detalhado do que chegou
      console.log('[BUILDER-HOOK] ✅ Data recebida:', {
        success: data?.success,
        hasSolution: !!data?.solution,
        solutionId: data?.solution?.id,
        solutionTitle: data?.solution?.title,
        warning: data?.warning
      });

      if (!data?.solution) {
        toast.error('Solução não gerada corretamente');
        return null;
      }

      // Verificar se solution tem pelo menos id
      if (!data.solution.id) {
        toast.error('Solução gerada mas não foi salva corretamente');
        return null;
      }

      // Validar qualidade do título
      const titleString = data.solution.title ? String(data.solution.title).trim() : '';
      const ideaLower = idea.toLowerCase().trim();
      const ideaStart = ideaLower.substring(0, 50);
      const titleLower = titleString.toLowerCase();
      
      // Detectar cópia literal da ideia
      const isLiteralCopy = titleLower.startsWith(ideaStart.substring(0, 30));
      
      // Detectar verbos proibidos
      const startsWithForbiddenVerb = /^(implementar|criar|fazer|quero|preciso|gostaria|desenvolver)/i.test(titleString);
      
      // Detectar truncamento no meio de palavra
      const endsWithIncompleteWord = titleString.length > 40 && !titleString.match(/[\s\-][\w]{3,}$/);
      
      const titleHasIssues = 
        !titleString || 
        titleString === 'undefined' || 
        titleString.length < 10 ||
        /^[A-Z][a-z]*(\s[A-Z][a-z]*){0,2}\.$/.test(titleString) ||
        isLiteralCopy ||
        startsWithForbiddenVerb ||
        endsWithIncompleteWord;
      
      if (titleHasIssues) {
        console.warn('[BUILDER-HOOK] ⚠️ Título com problema:', {
          title: titleString,
          isLiteralCopy,
          startsWithForbiddenVerb,
          endsWithIncompleteWord
        });
        toast.warning('Solução gerada mas o título pode estar incompleto', {
          description: 'Você pode editar manualmente na página da solução'
        });
      }

      // Avisar se foi salvo parcialmente por timeout
      if (data.warning === 'TIMEOUT_PARTIAL_SAVE') {
        toast.warning('Solução salva parcialmente devido a timeout', {
          description: 'Alguns detalhes podem estar incompletos'
        });
      } else {
        toast.success('Solução Builder gerada com sucesso! 🎉');
      }
      
      return data.solution;
    } catch (error) {
      console.error('[BUILDER] Erro ao gerar:', error);
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
      console.error('[BUILDER] Erro ao salvar solução:', error);
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
