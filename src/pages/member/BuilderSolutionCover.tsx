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

export default function BuilderSolutionCover() {
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

  const cards = [
    {
      title: "Detalhes Técnicos",
      subtitle: "Contexto e especificações completas",
      icon: Star,
      badge: "Overview",
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/30",
      path: `/ferramentas/builder/solution/${id}/detalhes`,
    },
    {
      title: "Framework de Implementação",
      subtitle: "Os 4 pilares da sua solução",
      icon: Compass,
      badge: "by Rafael Milagre",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      path: `/ferramentas/builder/solution/${id}/framework`,
    },
    {
      title: "Arquitetura e Fluxos",
      subtitle: "Diagramas técnicos completos",
      icon: Network,
      badge: "Fluxograma",
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
      path: `/ferramentas/builder/solution/${id}/arquitetura`,
    },
    {
      title: "Ferramentas Necessárias",
      subtitle: "Recursos essenciais e opcionais",
      icon: Wrench,
      badge: `${(solution?.required_tools?.essential?.length || 0) + (solution?.required_tools?.optional?.length || 0)} ferramentas`,
      color: "from-orange-500/20 to-yellow-500/20",
      borderColor: "border-orange-500/30",
      path: `/ferramentas/builder/solution/${id}/ferramentas`,
    },
    {
      title: "Plano de Ação",
      subtitle: "Checklist de implementação",
      icon: ClipboardCheck,
      badge: `${solution?.implementation_checklist?.length || 0} passos`,
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
      path: `/ferramentas/builder/solution/${id}/checklist`,
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
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LiquidGlassCard className="p-8 relative overflow-hidden">
              {/* Efeito de fundo */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
              
              <div className="relative z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/ferramentas/builder/historico')}
                  className="mb-6"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao histórico
                </Button>
                
                <div className="flex items-start justify-between gap-6 mb-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                        {solution.title || 'Solução Builder AI'}
                      </h1>
                      {solution.short_description && (
                        <p className="text-foreground/90 leading-relaxed text-xl max-w-3xl">
                          {solution.short_description}
                        </p>
                      )}
                    </div>

                    {/* Badges de contexto */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-sm px-4 py-1">
                        IA Generativa
                      </Badge>
                      <Badge variant="secondary" className="text-sm px-4 py-1">
                        Automação
                      </Badge>
                      <Badge variant="secondary" className="text-sm px-4 py-1">
                        Cloud Native
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <Star className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <Share2 className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Ideia Original */}
                <div className="pt-6 border-t border-border/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">💡 Ideia original:</p>
                  <p className="text-base text-foreground/80 italic leading-relaxed bg-surface-elevated/30 p-4 rounded-lg">
                    "{solution.original_idea}"
                  </p>
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <motion.button
                  key={index}
                  onClick={() => navigate(card.path)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.02, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    group relative p-6 rounded-2xl border-2 transition-all duration-300 
                    cursor-pointer overflow-hidden text-left
                    bg-gradient-to-br ${card.color}
                    ${card.borderColor} hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/30
                  `}
                >
                  {/* Glow effect animado no hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/0 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

                  {/* Conteúdo do card */}
                  <div className="relative z-10">
                    {/* Ícone grande + Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <Badge variant="secondary" className="text-xs px-3">
                        {card.badge}
                      </Badge>
                    </div>

                    {/* Título + Subtitle */}
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {card.subtitle}
                    </p>

                    {/* Arrow indicator com animação suave */}
                    <ArrowRight className="absolute bottom-5 right-5 h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all duration-300" />
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
