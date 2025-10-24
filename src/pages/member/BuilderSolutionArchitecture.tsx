import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SimpleMermaidRenderer } from '@/components/builder/flows/SimpleMermaidRenderer';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useSolutionCompletion } from '@/hooks/implementation/useSolutionCompletion';

export default function BuilderSolutionArchitecture() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  // Hook para marcar solução como completa
  const { isCompleting, handleConfirmImplementation } = useSolutionCompletion({
    progressId: undefined, // Será obtido do banco se necessário
    solutionId: id,
    moduleIdx: 0,
    completedModules,
    setCompletedModules
  });

  const { data: solution, isLoading, refetch } = useQuery({
    queryKey: ['builder-solution-architecture', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generated_solutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const generateArchitecture = async () => {
    if (!solution || !user) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-smart-architecture-flow', {
        body: { solutionId: solution.id, userId: user.id }
      });

      if (error) throw error;

      toast.success('Arquitetura inteligente gerada! 🎉');
      refetch();
    } catch (err: any) {
      console.error('Erro ao gerar arquitetura:', err);
      toast.error('Erro ao gerar arquitetura');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (solution && !solution.implementation_flow && !isGenerating) {
      generateArchitecture();
    }
  }, [solution]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirecionar para a nova página de fluxo
  useEffect(() => {
    if (id) {
      navigate(`/ferramentas/builder/solution/${id}/fluxo`);
    }
  }, [id, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
