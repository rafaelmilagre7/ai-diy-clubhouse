import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Network, Wrench, ClipboardCheck, ArrowRight, FileCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function BuilderSolutionCover() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);

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

  // Mapear cards para campos do banco e tipos de seção
  const sectionMapping: Record<string, { field: string; type: string; label: string }> = {
    'framework': { field: 'framework_mapping', type: 'framework', label: 'Framework de Implementação' },
    'arquitetura': { field: 'automation_journey_flow', type: 'architecture', label: 'Arquitetura e Fluxos' },
    'ferramentas': { field: 'required_tools', type: 'tools', label: 'Ferramentas Necessárias' },
    'checklist': { field: 'implementation_checklist', type: 'checklist', label: 'Plano de Ação' },
    'prompt': { field: 'lovable_prompt', type: 'lovable', label: 'Prompt Lovable' }
  };

  const handleCardClick = async (cardPath: string) => {
    const sectionKey = cardPath.split('/').pop() as string;
    const sectionInfo = sectionMapping[sectionKey];
    
    if (!sectionInfo || !solution) return;
    
    const hasContent = solution[sectionInfo.field] !== null && solution[sectionInfo.field] !== undefined;
    
    // Se já tem conteúdo, navega direto
    if (hasContent) {
      navigate(cardPath);
      return;
    }
    
    // Caso contrário, gera sob demanda
    setGeneratingSection(sectionInfo.label);
    
    try {
      console.log(`[COVER] Gerando ${sectionInfo.type} para solução ${solution.id}`);
      
      const { data, error } = await supabase.functions.invoke('generate-section-content', {
        body: {
          solutionId: solution.id,
          sectionType: sectionInfo.type,
          userId: solution.user_id
        }
      });
      
      if (error) {
        console.error('[COVER] Erro ao gerar:', error);
        throw error;
      }
      
      if (data?.success) {
        console.log(`[COVER] ✅ ${sectionInfo.label} gerado!`);
        toast.success(`${sectionInfo.label} gerado com sucesso! 🎉`);
        
        // Invalidar cache para recarregar dados
        await queryClient.invalidateQueries({ queryKey: ['builder-solution', id] });
        
        // Navegar para a página
        navigate(cardPath);
      } else {
        throw new Error('Resposta sem sucesso');
      }
    } catch (err: any) {
      console.error('[COVER] Erro:', err);
      toast.error('Erro ao gerar conteúdo', {
        description: 'Tente novamente em instantes.',
        action: {
          label: 'Tentar novamente',
          onClick: () => handleCardClick(cardPath)
        },
        duration: 10000
      });
    } finally {
      setGeneratingSection(null);
    }
  };

  const cards = [
    {
      title: "Framework de Implementação",
      subtitle: "Os 4 pilares da sua solução",
      icon: Compass,
      badge: "by Rafael Milagre",
      color: "from-cyan-500/20 to-teal-400/20",
      borderColor: "border-cyan-400/30",
      path: `/ferramentas/builder/solution/${id}/framework`,
    },
    {
      title: "Arquitetura e Fluxos",
      subtitle: "Diagramas técnicos completos",
      icon: Network,
      badge: "Fluxograma",
      color: "from-teal-500/20 to-cyan-400/20",
      borderColor: "border-teal-400/30",
      path: `/ferramentas/builder/solution/${id}/arquitetura`,
    },
    {
      title: "Ferramentas Necessárias",
      subtitle: "Recursos essenciais e opcionais",
      icon: Wrench,
      badge: `${(solution?.required_tools?.essential?.length || 0) + (solution?.required_tools?.optional?.length || 0)} ferramentas`,
      color: "from-emerald-500/20 to-teal-400/20",
      borderColor: "border-emerald-400/30",
      path: `/ferramentas/builder/solution/${id}/ferramentas`,
    },
    {
      title: "Plano de Ação",
      subtitle: "Checklist de implementação",
      icon: ClipboardCheck,
      badge: `${solution?.implementation_checklist?.length || 0} passos`,
      color: "from-cyan-400/20 to-teal-500/20",
      borderColor: "border-cyan-300/30",
      path: `/ferramentas/builder/solution/${id}/checklist`,
    },
    {
      title: "Prompt Lovable",
      subtitle: "Cole e comece seu projeto agora",
      icon: FileCode,
      badge: "Copy & Paste",
      color: "from-violet-500/20 to-purple-400/20",
      borderColor: "border-violet-400/30",
      path: `/ferramentas/builder/solution/${id}/prompt`,
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
                
                <div className="space-y-4">
                  <div>
                    <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                      {solution.title || 'Solução Builder'}
                    </h1>
                    {solution.short_description && (
                      <p className="text-foreground/90 leading-relaxed text-xl max-w-3xl">
                        {solution.short_description}
                      </p>
                    )}
                  </div>

                  {/* Badges dinâmicas */}
                  {solution.tags && solution.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {solution.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-sm px-4 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <motion.button
                  key={index}
                  onClick={() => handleCardClick(card.path)}
                  disabled={!!generatingSection}
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
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {/* Glow effect animado no hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/0 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

                  {/* Conteúdo do card */}
                  <div className="relative z-10">
                    {/* Ícone grande + Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-400/10 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
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

          {/* Loading Modal */}
          {generatingSection && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
              <LiquidGlassCard className="p-8 max-w-md mx-4">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <h3 className="text-xl font-bold">
                    Gerando {generatingSection}...
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Isso pode levar até 30 segundos
                  </p>
                </div>
              </LiquidGlassCard>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
