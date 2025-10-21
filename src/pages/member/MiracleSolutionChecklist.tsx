import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { ImplementationChecklist } from '@/components/builder/ImplementationChecklist';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function MiracleSolutionChecklist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: solution, isLoading } = useQuery({
    queryKey: ['miracle-solution', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('miracle_ai_solutions')
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
              onClick={() => navigate(`/ferramentas/miracleai/solution/${id}`)}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para visão geral
            </Button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Plano de Ação</h1>
              <p className="text-muted-foreground">
                Passos práticos para transformar sua ideia em realidade
              </p>
            </div>

            <ImplementationChecklist
              checklist={solution.implementation_checklist || []}
              solutionId={id || ''}
            />
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
