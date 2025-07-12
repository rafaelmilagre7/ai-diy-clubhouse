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
      const batchSize = 3; // Reduzido para 3 aulas por batch
      const allClassifications: ClassificationWithApproval[] = [];

      for (let i = 0; i < lessonsToProcess.length; i += batchSize) {
        const batch = lessonsToProcess.slice(i, i + batchSize);
        
        console.log(`📊 Processando batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(lessonsToProcess.length / batchSize)} com ${batch.length} aulas`);
        
        // Timeout controller com tempo aumentado
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 segundos

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
            
            // Mostrar erro mais específico baseado no tipo
            let errorMessage = 'Erro desconhecido';
            if (analysisError.message?.includes('OpenAI API key')) {
              errorMessage = 'Erro na configuração da chave OpenAI';
            } else if (analysisError.message?.includes('timeout')) {
              errorMessage = 'Timeout na análise - batch muito grande';
            } else if (analysisError.message?.includes('rate limit')) {
              errorMessage = 'Limite de taxa da OpenAI atingido';
            } else if (analysisError.message) {
              errorMessage = analysisError.message;
            }
            
            toast.error(`Erro na análise: ${errorMessage}`);
            // Continuar com próximo batch mesmo se um falhar
            continue;
          }

          if (analysisData?.analyses) {
            console.log(`✅ Batch processado com sucesso: ${analysisData.analyses.length} aulas analisadas`);
            
            // Log das estatísticas se disponível
            if (analysisData.stats) {
              console.log(`📊 Estatísticas do batch:`, analysisData.stats);
            }
            
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
          } else {
            console.warn('⚠️ Resposta vazia do batch - nenhuma análise retornada');
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

  const testConfiguration = async () => {
    try {
      console.log('🧪 Testando configuração...');
      
      // Primeiro testar função de teste (sem JWT)
      const { data: testData, error: testError } = await supabase.functions.invoke('classify-lessons-test', {
        body: { test: 'configuration' }
      });

      console.log('📊 Resultado teste básico:', { testData, testError });

      if (testError) {
        console.error('❌ Erro no teste básico:', testError);
        toast.error(`Erro no teste: ${testError.message}`);
        return false;
      }

      if (testData?.success) {
        console.log('✅ Teste básico OK');
        toast.success('✅ OpenAI configurado e funcionando!');
        
        // Agora testar função principal com modo test
        const { data, error } = await supabase.functions.invoke('classify-lessons', {
          body: { mode: 'test' }
        });

        if (error) {
          console.error('❌ Erro no teste da função principal:', error);
          toast.error(`Erro na função principal: ${error.message}`);
          return false;
        }

        console.log('✅ Função principal também funcionando:', data);
        return true;
      } else {
        const errorMsg = testData?.error || 'Erro desconhecido';
        toast.error(`❌ Configuração com problema: ${errorMsg}`);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erro no teste de configuração:', error);
      toast.error('Erro ao testar configuração');
      return false;
    }
  };

  const debugSingleLesson = async (lessonId: string) => {
    try {
      console.log('🐛 Iniciando debug de aula única...');
      
      // Buscar dados da aula
      const { data: lesson, error } = await supabase
        .from('learning_lessons')
        .select('id, title, description, difficulty_level')
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      const { data, error: debugError } = await supabase.functions.invoke('classify-lessons', {
        body: { 
          mode: 'debug',
          lessons: [lesson]
        }
      });

      if (debugError) {
        console.error('❌ Erro no debug:', debugError);
        toast.error(`Erro no debug: ${debugError.message}`);
        return false;
      }

      console.log('✅ Debug concluído:', data);
      toast.success('✅ Debug concluído - verifique o console para detalhes');
      return true;
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      toast.error('Erro no debug da aula');
      return false;
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
    applyClassifications,
    testConfiguration,
    debugSingleLesson
  };
};