import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Zap, TrendingUp, Clock, Brain, Code2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function MiracleSolutionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: solution, isLoading } = useQuery({
    queryKey: ['miracle-solution', id],
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

  const technicalOverview = solution.technical_overview || {};
  const competitiveAdvantages = solution.competitive_advantages || [];
  const expectedKpis = solution.expected_kpis || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
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

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Detalhes Técnicos da Solução
              </h1>
              <p className="text-muted-foreground text-lg">
                Contexto estratégico e especificações técnicas completas
              </p>
            </div>

            {/* Overview Técnico */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <LiquidGlassCard variant="premium" className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Brain className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold">Complexidade</h3>
                </div>
                <Badge variant="secondary" className="text-lg">
                  {technicalOverview.complexity || 'Média'}
                </Badge>
              </LiquidGlassCard>

              <LiquidGlassCard variant="premium" className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <Clock className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold">Tempo Estimado</h3>
                </div>
                <Badge variant="secondary" className="text-lg">
                  {technicalOverview.estimated_time || '4-6 semanas'}
                </Badge>
              </LiquidGlassCard>

              <LiquidGlassCard variant="premium" className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Code2 className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold">Stack Principal</h3>
                </div>
                <Badge variant="secondary" className="text-lg">
                  {technicalOverview.main_stack || 'Cloud Native'}
                </Badge>
              </LiquidGlassCard>
            </div>

            {/* Contexto do Negócio */}
            {solution.business_context && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <LiquidGlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-orange-500/10">
                      <Target className="h-6 w-6 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Contexto & Objetivos</h2>
                  </div>
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {solution.business_context}
                  </p>
                </LiquidGlassCard>
              </motion.div>
            )}

            {/* Diferenciais Competitivos */}
            {competitiveAdvantages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <LiquidGlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-cyan-500/10">
                      <Zap className="h-6 w-6 text-cyan-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Diferenciais Competitivos</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {competitiveAdvantages.map((advantage: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-surface-elevated/50 border border-border/30"
                      >
                        <h3 className="font-semibold text-primary mb-2">
                          {advantage.title || `Diferencial ${index + 1}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {advantage.description || advantage}
                        </p>
                      </div>
                    ))}
                  </div>
                </LiquidGlassCard>
              </motion.div>
            )}

            {/* KPIs Esperados */}
            {expectedKpis.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <LiquidGlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-pink-500/10">
                      <TrendingUp className="h-6 w-6 text-pink-500" />
                    </div>
                    <h2 className="text-2xl font-bold">KPIs & Resultados Esperados</h2>
                  </div>
                  <div className="space-y-4">
                    {expectedKpis.map((kpi: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary"
                      >
                        <Rocket className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-1">
                            {kpi.metric || kpi.title || `KPI ${index + 1}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {kpi.target || kpi.description || kpi}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </LiquidGlassCard>
              </motion.div>
            )}

            {/* Timeline Visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <LiquidGlassCard className="p-6">
                <h2 className="text-2xl font-bold mb-6">Timeline de Implementação</h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
                  
                  {['Planejamento', 'Desenvolvimento', 'Testes', 'Deploy'].map((phase, index) => (
                    <div key={index} className="relative pl-12 pb-8 last:pb-0">
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="p-4 rounded-lg bg-surface-elevated/50 border border-border/30">
                        <h3 className="font-semibold mb-1">{phase}</h3>
                        <p className="text-sm text-muted-foreground">
                          Fase {index + 1} da implementação
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>
            </motion.div>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
