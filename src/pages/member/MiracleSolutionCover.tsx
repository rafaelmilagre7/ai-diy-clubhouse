import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Network, Wrench, ClipboardCheck, ArrowRight, Star, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function MiracleSolutionCover() {
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

  const cards = [
    {
      title: "Framework de Implementação",
      subtitle: "Os 4 pilares da sua solução",
      icon: Compass,
      badge: "by Rafael Milagre",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      path: `/ferramentas/miracleai/solution/${id}/framework`,
    },
    {
      title: "Arquitetura e Fluxos",
      subtitle: "Diagramas técnicos completos",
      icon: Network,
      badge: "1 fluxo", // TODO: tornar dinâmico
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
      path: `/ferramentas/miracleai/solution/${id}/arquitetura`,
    },
    {
      title: "Ferramentas Necessárias",
      subtitle: "Recursos essenciais e opcionais",
      icon: Wrench,
      badge: `${(solution?.required_tools?.essential?.length || 0) + (solution?.required_tools?.optional?.length || 0)} ferramentas`,
      color: "from-orange-500/20 to-yellow-500/20",
      borderColor: "border-orange-500/30",
      path: `/ferramentas/miracleai/solution/${id}/ferramentas`,
    },
    {
      title: "Plano de Ação",
      subtitle: "Checklist de implementação",
      icon: ClipboardCheck,
      badge: `${solution?.implementation_checklist?.length || 0} passos`,
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
      path: `/ferramentas/miracleai/solution/${id}/checklist`,
    },
  ];

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
          className="space-y-6"
        >
          {/* Header */}
          <LiquidGlassCard className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/ferramentas/miracleai/historico')}
                  className="mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao histórico
                </Button>
                
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {solution.title || 'Solução Miracle AI'}
                  </h1>
                  {solution.short_description && (
                    <p className="text-foreground/80 leading-relaxed text-lg">
                      {solution.short_description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Ideia Original */}
            <div className="pt-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Ideia original:</p>
              <p className="text-sm text-foreground/70 italic">"{solution.original_idea}"</p>
            </div>
          </LiquidGlassCard>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <motion.button
                  key={index}
                  onClick={() => navigate(card.path)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    group relative p-8 rounded-2xl border-2 transition-all duration-300 
                    cursor-pointer overflow-hidden text-left
                    bg-gradient-to-br ${card.color}
                    ${card.borderColor} hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20
                  `}
                >
                  {/* Glow effect no hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Conteúdo do card */}
                  <div className="relative z-10">
                    {/* Ícone grande + Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-4 rounded-xl bg-primary/10 text-primary">
                        <IconComponent className="h-10 w-10" />
                      </div>
                      <Badge variant="secondary">{card.badge}</Badge>
                    </div>

                    {/* Título + Subtitle */}
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {card.subtitle}
                    </p>

                    {/* Arrow indicator */}
                    <ArrowRight className="absolute bottom-6 right-6 h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
