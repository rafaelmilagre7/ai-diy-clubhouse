import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { LearningRecommendationsCard } from '@/components/builder/LearningRecommendationsCard';
import { motion } from 'framer-motion';
import { useLearningRecommendations } from '@/hooks/useLearningRecommendations';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BuilderSectionLoader, RECOMMENDATIONS_MESSAGES } from '@/components/builder/BuilderSectionLoader';

export default function BuilderSolutionRecommendations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isManuallyGenerating, setIsManuallyGenerating] = useState(false);
  
  const { data: recommendations, isLoading, error } = useLearningRecommendations(id);

  const handleManualGenerate = async () => {
    if (!id) return;
    
    setIsManuallyGenerating(true);
    console.log('[RECOMMENDATIONS] 🔄 Gerando recomendações manualmente...');

    try {
      const { data, error } = await supabase.functions.invoke(
        'recommend-learning-content',
        {
          body: { solutionId: id }
        }
      );

      if (error) throw error;

      queryClient.invalidateQueries({ 
        queryKey: ['learning-recommendations', id] 
      });

      toast.success('Recomendações geradas! 🎓');
      
    } catch (err: any) {
      console.error('[RECOMMENDATIONS] ❌ Erro:', err);
      toast.error('Erro ao gerar recomendações', {
        description: err.message || 'Tente novamente em alguns instantes'
      });
    } finally {
      setIsManuallyGenerating(false);
    }
  };

  if (isLoading || isManuallyGenerating) {
    return (
      <BuilderSectionLoader 
        title="Buscando Conteúdos Recomendados..."
        messages={RECOMMENDATIONS_MESSAGES}
        estimatedSeconds={30}
      />
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <p className="text-muted-foreground mb-4">
            Erro ao carregar recomendações
          </p>
          <p className="text-sm text-muted-foreground/70 mb-6">
            {error instanceof Error ? error.message : 'Tente novamente'}
          </p>
          <Button onClick={handleManualGenerate}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            📚 Conteúdos Recomendados
          </h1>
          <p className="text-foreground/70 text-lg">
            Aulas selecionadas por IA para implementar sua solução
          </p>
        </div>

        {!recommendations || recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">
              Nenhuma recomendação encontrada ainda
            </p>
            <p className="text-sm text-muted-foreground/70 mb-6">
              Clique no botão abaixo para gerar recomendações personalizadas com IA
            </p>
            <Button onClick={handleManualGenerate} disabled={isManuallyGenerating}>
              {isManuallyGenerating ? 'Gerando...' : 'Gerar Recomendações'}
            </Button>
          </div>
        ) : (
          <LearningRecommendationsCard solutionId={id || ''} />
        )}
      </motion.div>
    </div>
  );
}
