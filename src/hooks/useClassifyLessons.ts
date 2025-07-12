import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface LessonAnalysis {
  lessonId: string;
  suggestedTags: {
    tema: string[];
    ferramenta: string[];
    nivel: string[];
    formato: string[];
  };
  confidence: number;
  reasoning: string;
}

interface ClassificationWithApproval extends LessonAnalysis {
  approved: boolean;
  lessonTitle: string;
}

export const useClassifyLessons = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [classifications, setClassifications] = useState<ClassificationWithApproval[]>([]);

  const analyzeLessons = async (lessonIds?: string[]) => {
    setIsAnalyzing(true);
    try {
      // Buscar aulas para analisar
      let query = supabase
        .from('learning_lessons')
        .select(`
          id,
          title,
          description,
          difficulty_level,
          module:learning_modules!inner(
            course:learning_courses!inner(title)
          )
        `);

      if (lessonIds && lessonIds.length > 0) {
        query = query.in('id', lessonIds);
      }

      const { data: lessons, error } = await query;

      if (error) throw error;

      if (!lessons || lessons.length === 0) {
        toast.error('Nenhuma aula encontrada para análise');
        return;
      }

      // Chamar edge function para análise
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'classify-lessons',
        {
          body: { 
            lessons: lessons.map(lesson => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              difficulty_level: lesson.difficulty_level
            })),
            mode: 'analyze'
          }
        }
      );

      if (analysisError) throw analysisError;

      // Combinar resultados com dados das aulas
      const classificationsWithApproval: ClassificationWithApproval[] = analysisData.analyses.map(
        (analysis: LessonAnalysis) => {
          const lesson = lessons.find(l => l.id === analysis.lessonId);
          return {
            ...analysis,
            approved: analysis.confidence > 0.7, // Auto-aprovar se confiança > 70%
            lessonTitle: lesson?.title || 'Título não encontrado'
          };
        }
      );

      setClassifications(classificationsWithApproval);
      toast.success(`${classificationsWithApproval.length} aulas analisadas`);

    } catch (error) {
      console.error('Erro ao analisar aulas:', error);
      toast.error('Erro ao analisar aulas');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleApproval = (lessonId: string) => {
    setClassifications(prev => 
      prev.map(c => 
        c.lessonId === lessonId 
          ? { ...c, approved: !c.approved }
          : c
      )
    );
  };

  const approveAll = () => {
    setClassifications(prev => prev.map(c => ({ ...c, approved: true })));
  };

  const rejectAll = () => {
    setClassifications(prev => prev.map(c => ({ ...c, approved: false })));
  };

  const applyClassifications = async () => {
    setIsApplying(true);
    try {
      const approvedClassifications = classifications.filter(c => c.approved);
      
      if (approvedClassifications.length === 0) {
        toast.error('Nenhuma classificação aprovada para aplicar');
        return;
      }

      const { error } = await supabase.functions.invoke('classify-lessons', {
        body: {
          mode: 'apply',
          classifications: approvedClassifications
        }
      });

      if (error) throw error;

      toast.success(`Tags aplicadas em ${approvedClassifications.length} aulas`);
      setClassifications([]);

    } catch (error) {
      console.error('Erro ao aplicar classificações:', error);
      toast.error('Erro ao aplicar classificações');
    } finally {
      setIsApplying(false);
    }
  };

  return {
    isAnalyzing,
    isApplying,
    classifications,
    analyzeLessons,
    toggleApproval,
    approveAll,
    rejectAll,
    applyClassifications
  };
};