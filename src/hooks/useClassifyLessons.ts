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
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const analyzeLessons = async (lessonIds?: string[]) => {
    setIsAnalyzing(true);
    setProgress({ current: 0, total: 0 });
    setClassifications([]);

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

      // Limitar número de aulas por processamento
      const maxLessons = 10;
      const lessonsToProcess = lessons.slice(0, maxLessons);
      
      if (lessons.length > maxLessons) {
        toast.info(`Processando primeiras ${maxLessons} aulas de ${lessons.length} encontradas`);
      }

      setProgress({ current: 0, total: lessonsToProcess.length });

      // Processar em batches menores para evitar timeout
      const batchSize = 5;
      const allClassifications: ClassificationWithApproval[] = [];

      for (let i = 0; i < lessonsToProcess.length; i += batchSize) {
        const batch = lessonsToProcess.slice(i, i + batchSize);
        
        // Timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 segundos

        try {
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
            'classify-lessons',
            {
              body: { 
                lessons: batch.map(lesson => ({
                  id: lesson.id,
                  title: lesson.title,
                  description: lesson.description,
                  difficulty_level: lesson.difficulty_level
                })),
                mode: 'analyze'
              },
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          clearTimeout(timeoutId);

          if (analysisError) {
            console.error('Erro na análise do batch:', analysisError);
            toast.error(`Erro na análise: ${analysisError.message || 'Erro desconhecido'}`);
            // Continuar com próximo batch mesmo se um falhar
            continue;
          }

          if (analysisData?.analyses) {
            // Combinar resultados com dados das aulas
            const batchClassifications: ClassificationWithApproval[] = analysisData.analyses.map(
              (analysis: LessonAnalysis) => {
                const lesson = batch.find(l => l.id === analysis.lessonId);
                return {
                  ...analysis,
                  approved: analysis.confidence > 0.7,
                  lessonTitle: lesson?.title || 'Título não encontrado'
                };
              }
            );

            allClassifications.push(...batchClassifications);
          }

          setProgress({ current: Math.min(i + batchSize, lessonsToProcess.length), total: lessonsToProcess.length });

        } catch (batchError) {
          clearTimeout(timeoutId);
          console.error('Erro no batch:', batchError);
          
          if (batchError.name === 'AbortError') {
            toast.error('Timeout na análise - processando próximo lote');
          }
          // Continuar com próximo batch
        }
      }

      setClassifications(allClassifications);
      
      if (allClassifications.length > 0) {
        toast.success(`${allClassifications.length} aulas analisadas com sucesso`);
      } else {
        toast.error('Nenhuma aula pôde ser analisada. Tente novamente.');
      }

    } catch (error) {
      console.error('Erro ao analisar aulas:', error);
      toast.error(`Erro ao analisar aulas: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsAnalyzing(false);
      setProgress({ current: 0, total: 0 });
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
    progress,
    analyzeLessons,
    toggleApproval,
    approveAll,
    rejectAll,
    applyClassifications
  };
};