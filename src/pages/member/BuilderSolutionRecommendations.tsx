import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { LearningRecommendationsCard } from '@/components/builder/LearningRecommendationsCard';
import { motion } from 'framer-motion';

export default function BuilderSolutionRecommendations() {
  const { id } = useParams();
  const navigate = useNavigate();

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
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-400/10">
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Conteúdos Recomendados</h1>
            <p className="text-muted-foreground">
              Aulas selecionadas por IA para implementar sua solução
            </p>
          </div>
        </div>

        <LiquidGlassCard className="p-6">
          <LearningRecommendationsCard solutionId={id || ''} />
        </LiquidGlassCard>
      </motion.div>
    </div>
  );
}
