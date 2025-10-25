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
import LoadingScreen from '@/components/common/LoadingScreen';

export default function BuilderSolutionRecommendations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRetryOption, setShowRetryOption] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const { data: recommendations, isLoading } = useLearningRecommendations(id);

  // Timer visual
  useEffect(() => {
    if (!isLoading && !isGenerating) return;
    
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(timer);
      setElapsedTime(0);
    };
  }, [isLoading, isGenerating]);

  // Auto-geração inteligente
  useEffect(() => {
    const generateIfNeeded = async () => {
      if (recommendations || isLoading || isGenerating || !id) return;

      console.log('[RECOMMENDATIONS] Iniciando geração automática...');
      setIsGenerating(true);
      setElapsedTime(0);

      try {
        const timeoutId = setTimeout(() => {
          setShowRetryOption(true);
          console.error('[RECOMMENDATIONS] Timeout após 60 segundos');
        }, 60000);

        const { data, error } = await supabase.functions.invoke(
          'recommend-learning-content',
          {
            body: { solutionId: id }
          }
        );

        clearTimeout(timeoutId);

        if (error) throw error;

        queryClient.invalidateQueries({ 
          queryKey: ['learning-recommendations', id] 
        });

        toast.success('Recomendações geradas! 🎓');
        
      } catch (err: any) {
        console.error('[RECOMMENDATIONS] Erro:', err);
        
        if (err.name === 'AbortError') {
          toast.error('Tempo esgotado', {
            description: 'A geração demorou muito. Tente recarregar.'
          });
        } else {
          toast.error('Erro ao gerar recomendações', {
            description: err.message
          });
        }
      } finally {
        setIsGenerating(false);
      }
    };

    generateIfNeeded();
  }, [id, recommendations, isLoading, isGenerating, queryClient]);

  if (isLoading || isGenerating) {
    return (
      <LoadingScreen 
        message="Buscando Conteúdos Recomendados" 
        description="A IA está analisando milhares de aulas para encontrar as mais relevantes para sua solução..."
        showProgress={true}
        estimatedSeconds={45}
      />
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

        <LearningRecommendationsCard solutionId={id || ''} />
      </motion.div>

      {/* Tela de retry */}
      {showRetryOption && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-lg p-6 shadow-lg max-w-md text-center">
            <p className="text-muted-foreground mb-4">
              A geração está demorando mais que o esperado.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
