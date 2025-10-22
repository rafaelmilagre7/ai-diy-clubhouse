import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { FrameworkQuadrants } from '@/components/builder/FrameworkQuadrants';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function BuilderSolutionFramework() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: solution, isLoading } = useQuery({
    queryKey: ['builder-solution', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generated_solutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Solução não encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LiquidGlassCard className="p-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para visão geral
            </Button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Framework de Implementação de IA
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="default" className="text-base px-4 py-1.5 bg-gradient-to-r from-primary to-primary/80">
                  by Rafael Milagre
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Os 4 pilares essenciais da sua solução com Inteligência Artificial
              </p>
            </div>

            <FrameworkQuadrants framework={solution.framework_mapping} />
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
