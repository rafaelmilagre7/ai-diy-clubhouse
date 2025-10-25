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
    </div>
  );
}
