import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Network, Wrench, ClipboardCheck, ArrowRight, FileCode, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { LearningRecommendationsCard } from '@/components/builder/LearningRecommendationsCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UnifiedLoadingScreen } from '@/components/common/UnifiedLoadingScreen';
import { getLoadingMessages } from '@/lib/loadingMessages';

export default function BuilderSolutionCover() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [generatingLovablePrompt, setGeneratingLovablePrompt] = useState(false);

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

  // 🚀 POLLING para Lovable Prompt quando não existe ainda
  React.useEffect(() => {
    if (!solution?.lovable_prompt && solution?.id && !generatingLovablePrompt) {
      console.log('[COVER] 🔄 Iniciando polling para lovable_prompt...');
      setGeneratingLovablePrompt(true);
      
      const pollInterval = setInterval(async () => {
        console.log('[COVER] 🔍 Verificando se lovable_prompt foi gerado...');
        
        const { data } = await supabase
          .from('ai_generated_solutions')
          .select('lovable_prompt')
          .eq('id', solution.id)
          .single();
        
        if (data?.lovable_prompt) {
          console.log('[COVER] ✅ Lovable prompt gerado com sucesso!');
          setGeneratingLovablePrompt(false);
          queryClient.invalidateQueries({ queryKey: ['builder-solution', solution.id] });
          clearInterval(pollInterval);
        }
      }, 5000); // Verificar a cada 5s
      
      // Timeout após 90s
      const timeout = setTimeout(() => {
        console.log('[COVER] ⏱️ Timeout do polling de lovable_prompt (90s)');
        clearInterval(pollInterval);
        setGeneratingLovablePrompt(false);
      }, 90000);
      
      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeout);
      };
    }
  }, [solution?.id, solution?.lovable_prompt, generatingLovablePrompt, queryClient]);

  // Mapear cards para campos do banco e tipos de seção
  const sectionMapping: Record<string, { field: string; type: string; label: string }> = {
    'framework': { field: 'framework_mapping', type: 'framework', label: 'Framework de Implementação' },
    'arquitetura': { field: 'implementation_flow', type: 'flow', label: 'Arquitetura e Fluxos' },
    'ferramentas': { field: 'required_tools', type: 'tools', label: 'Ferramentas Necessárias' },
    'checklist': { field: 'implementation_checklist', type: 'checklist', label: 'Plano de Ação' },
    'prompt': { field: 'lovable_prompt', type: 'lovable', label: 'Prompt Lovable' }
  };

  // Validar pré-requisitos para o plano de ação
  const validatePrerequisites = (sectionKey: string): { valid: boolean; message?: string } => {
    if (sectionKey !== 'checklist') return { valid: true };
    
    // Verificar se framework, arquitetura e ferramentas estão gerados
    const hasFramework = solution?.framework_mapping !== null && solution?.framework_mapping !== undefined;
    const hasArchitecture = solution?.implementation_flow !== null && solution?.implementation_flow !== undefined;
    const hasTools = solution?.required_tools !== null && solution?.required_tools !== undefined;
    
    if (!hasFramework || !hasArchitecture || !hasTools) {
      const missing: string[] = [];
      if (!hasFramework) missing.push('Framework');
      if (!hasArchitecture) missing.push('Arquitetura');
      if (!hasTools) missing.push('Ferramentas');
      
      return {
        valid: false,
        message: `Complete estas etapas primeiro: ${missing.join(', ')}`
      };
    }
    
    return { valid: true };
  };

  const handleCardClick = async (cardPath: string) => {
    const sectionKey = cardPath.split('/').pop() as string;
    
    // 🎯 CASO ESPECIAL: Recomendações navega direto (não precisa gerar nada)
    if (sectionKey === 'recomendacoes') {
      console.log('[COVER] 📚 Navegando para recomendações...');
      navigate(cardPath);
      return;
    }
    
    const sectionInfo = sectionMapping[sectionKey];
    
    if (!sectionInfo || !solution) return;
    
    // Validar pré-requisitos
    const validation = validatePrerequisites(sectionKey);
    if (!validation.valid) {
      toast.error('Pré-requisitos não atendidos', {
        description: validation.message,
        duration: 5000
      });
      return;
    }
    
    console.log('[COVER] 📍 Navegando para:', cardPath);
    console.log('[COVER] 📊 Seção:', sectionInfo);
    console.log('[COVER] 📦 Campo no banco:', sectionInfo.field, '=', solution[sectionInfo.field]);
    
    const hasContent = solution[sectionInfo.field] !== null && solution[sectionInfo.field] !== undefined;
    
    // Se já tem conteúdo, navega direto
    if (hasContent) {
      console.log('[COVER] ✅ Conteúdo já existe, navegando...');
      navigate(cardPath);
      return;
    }
    
    console.log('[COVER] 🔄 Conteúdo não existe, gerando...');
    
    // 🔍 Para checklist, verificar se já existe ANTES de disparar geração
    if (sectionKey === 'checklist') {
      console.log('[COVER] 🔍 Verificando se checklist já existe...');
      
      const { data: existing } = await supabase
        .from('unified_checklists')
        .select('id')
        .eq('solution_id', solution.id)
        .eq('checklist_type', 'implementation')
        .maybeSingle();
      
      if (existing) {
        console.log('[COVER] ✅ Checklist já existe, navegando direto');
        navigate(cardPath);
        return;
      }
      
      console.log('[COVER] 📋 Gerando checklist pela primeira vez...');
      
      // Ativar tela de loading
      setGeneratingSection(sectionInfo.label);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-section-content', {
          body: {
            solutionId: solution.id,
            sectionType: sectionInfo.type,
            userId: solution.user_id
          }
        });
        
        if (error) {
          console.error('[COVER] ❌ Erro ao gerar checklist:', error);
          throw error;
        }
        
        if (data?.success) {
          console.log('[COVER] ✅ Checklist gerado com sucesso!');
          toast.success('Plano de ação gerado com sucesso! 🎉');
          
          // Invalidar cache
          await queryClient.invalidateQueries({ queryKey: ['builder-solution', id] });
          await queryClient.invalidateQueries({ queryKey: ['unified-checklist-exists', id] });
          await queryClient.invalidateQueries({ queryKey: ['unified-checklist-template', id, 'implementation'] });
          
          console.log('[COVER] 🔄 Aguardando checklist ser criado no banco...');
          
          // 🆕 POLLING INTELIGENTE: Aguardar até checklist existir (máximo 30s)
          const startWait = Date.now();
          const maxWait = 30000; // 30 segundos
          let checklistExists = false;
          
          while (!checklistExists && (Date.now() - startWait) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Verificar a cada 2s
            
            const { data: check } = await supabase
              .from('unified_checklists')
              .select('id')
              .eq('solution_id', solution.id)
              .eq('checklist_type', 'implementation')
              .maybeSingle();
            
            if (check) {
              checklistExists = true;
              console.log('[COVER] ✅ Checklist confirmado no banco!');
            } else {
              console.log('[COVER] ⏳ Ainda aguardando checklist...');
            }
          }
          
          if (!checklistExists) {
            throw new Error('Checklist não foi criado no tempo esperado');
          }
          
          console.log('[COVER] ➡️ Navegando para checklist...');
          
          // Navegar para a página do checklist
          navigate(cardPath);
        } else {
          throw new Error(data?.error || 'Falha ao gerar plano de ação');
        }
      } catch (err: any) {
        console.error('[COVER] ❌ Erro completo:', err);
        toast.error('Erro ao gerar plano de ação', {
          description: err.message || 'Tente novamente em instantes.',
          action: {
            label: 'Tentar novamente',
            onClick: () => handleCardClick(cardPath)
          },
          duration: 10000
        });
      } finally {
        setGeneratingSection(null);
      }
      
      return;
    }
    
    // Caso contrário, gera sob demanda e bloqueia
    setGeneratingSection(sectionInfo.label);
    
    try {
      // Para arquitetura/fluxo, usar função dedicada
      if (sectionKey === 'arquitetura') {
        console.log('[COVER] 🌊 Chamando generate-implementation-flow');
        
        const { data, error } = await supabase.functions.invoke('generate-implementation-flow', {
          body: {
            solutionId: solution.id,
            userId: solution.user_id
          }
        });
        
        if (error) {
          console.error('[COVER] ❌ Erro ao gerar fluxo:', error);
          throw error;
        }
        
        if (data?.success) {
          console.log('[COVER] ✅ Fluxo gerado com sucesso!');
          toast.success('Fluxo de implementação gerado! 🎉');
          
          // Invalidar cache e navegar
          await queryClient.invalidateQueries({ queryKey: ['builder-solution', id] });
          navigate(cardPath);
        } else {
          throw new Error(data?.error || 'Falha ao gerar fluxo');
        }
      } else {
        // Para outras seções, usar generate-section-content
        console.log(`[COVER] 📝 Gerando ${sectionInfo.type} via generate-section-content`);
        
        const { data, error } = await supabase.functions.invoke('generate-section-content', {
          body: {
            solutionId: solution.id,
            sectionType: sectionInfo.type,
            userId: solution.user_id
          }
        });
        
        if (error) {
          console.error('[COVER] ❌ Erro ao gerar:', error);
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
      }
    } catch (err: any) {
      console.error('[COVER] ❌ Erro completo:', err);
      toast.error('Erro ao gerar conteúdo', {
        description: err.message || 'Tente novamente em instantes.',
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
      badge: "Implementação",
      color: "from-violet-500/20 to-purple-400/20",
      borderColor: "border-violet-400/30",
      path: `/ferramentas/builder/solution/${id}/prompt`,
    },
    {
      title: "Conteúdos Recomendados",
      subtitle: "Aulas selecionadas por IA para implementar sua solução",
      icon: BookOpen,
      badge: "Aprendizado",
      color: "from-blue-500/20 to-indigo-400/20",
      borderColor: "border-blue-400/30",
      path: `/ferramentas/builder/solution/${id}/recomendacoes`,
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
              const sectionKey = card.path.split('/').pop() as string;
              const validation = validatePrerequisites(sectionKey);
              const isDisabled = !!generatingSection || !validation.valid;
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleCardClick(card.path)}
                  disabled={isDisabled}
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
                    ${!validation.valid ? 'opacity-60 grayscale' : ''}
                  `}
                  title={!validation.valid ? validation.message : undefined}
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
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-3"
                      >
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

          {/* Loading Screen Unificado */}
          {generatingSection && (
            <UnifiedLoadingScreen
              title={`Gerando ${generatingSection}...`}
              messages={getLoadingMessages('builder_generating')}
              estimatedSeconds={45}
              showTimer={true}
              showProgressBar={true}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
