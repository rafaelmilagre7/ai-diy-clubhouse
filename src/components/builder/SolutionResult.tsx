import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Share2, Download, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { FrameworkQuadrants } from './FrameworkQuadrants';
import { RequiredToolsGrid } from './RequiredToolsGrid';
import UnifiedChecklistTab from '@/components/unified-checklist/UnifiedChecklistTab';
import { ArchitectureFlowchart } from './ArchitectureFlowchart';
import { LearningRecommendationsCard } from './LearningRecommendationsCard';

interface SolutionResultProps {
  solution: any;
  onNewIdea: () => void;
}

export const SolutionResult: React.FC<SolutionResultProps> = ({ 
  solution, 
  onNewIdea
}) => {
  console.log('🔍 [SOLUTION RESULT] Componente renderizado', { 
    solutionId: solution?.id,
    hasFramework: !!solution?.framework_mapping,
    hasLovablePrompt: !!solution?.lovable_prompt
  });

  // Estado para controlar expansão de seções on-demand
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set());
  const [solutionData, setSolutionData] = useState<any>(solution);

  const toggleSection = async (sectionId: string) => {
    // Se já expandido, apenas fechar
    if (expandedSections.has(sectionId)) {
      setExpandedSections(prev => {
        const newSet = new Set(prev);
        newSet.delete(sectionId);
        return newSet;
      });
      return;
    }

    // Recomendações são sempre geradas on-demand via hook
    if (sectionId === 'recommendations') {
      setExpandedSections(prev => new Set([...prev, sectionId]));
      return;
    }

    // Mapear sectionId para campo do banco e tipo
  const sectionMapping: Record<string, { field: string; type: string }> = {
    'tools': { field: 'required_tools', type: 'tools' },
    'checklist': { field: 'implementation_checklist', type: 'checklist' },
    'architecture': { field: 'architecture_flowchart', type: 'architecture' },
    'recommendations': { field: 'learning_recommendations', type: 'recommendations' },
    'lovable': { field: 'lovable_prompt', type: 'lovable' }
  };

    const mapping = sectionMapping[sectionId];
    const hasContent = mapping && solutionData[mapping.field];

    // Se já tem conteúdo, apenas expandir
    if (hasContent) {
      setExpandedSections(prev => new Set([...prev, sectionId]));
      return;
    }

    // Caso contrário, gerar conteúdo sob demanda
    setLoadingSections(prev => new Set([...prev, sectionId]));
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-section-content', {
        body: {
          solutionId: solutionData.id,
          sectionType: mapping.type,
          userId: solutionData.user_id
        }
      });

      if (error) throw error;

      if (data?.success) {
        // Atualizar estado local
        setSolutionData((prev: any) => ({
          ...prev,
          [mapping.field]: data.content
        }));
        
        // Expandir seção
        setExpandedSections(prev => new Set([...prev, sectionId]));
        toast.success('Conteúdo gerado com sucesso! 🎉');
      }
    } catch (err: any) {
      console.error('Erro ao gerar seção:', err);
      toast.error('Erro ao gerar conteúdo', {
        description: 'Tente novamente em instantes.'
      });
    } finally {
      setLoadingSections(prev => {
        const newSet = new Set(prev);
        newSet.delete(sectionId);
        return newSet;
      });
    }
  };

  const isExpanded = (sectionId: string) => expandedSections.has(sectionId);
  const isLoading = (sectionId: string) => loadingSections.has(sectionId);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header com Descrição */}
      <LiquidGlassCard className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold">Solução Gerada</h2>
            {solution.short_description && (
              <p className="text-foreground/80 leading-relaxed">
                {solution.short_description}
              </p>
            )}
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

        {/* Ideia Original - sem badge */}
        <div className="pt-4 border-t border-border/30">
          <p className="text-sm text-muted-foreground mb-1">Ideia original:</p>
          <p className="text-sm text-foreground/70 italic">"{solution.original_idea}"</p>
        </div>
      </LiquidGlassCard>

      {/* Framework Visual - Destaque Principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <LiquidGlassCard className="p-6 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Framework de Implementação</h3>
            <p className="text-sm text-muted-foreground">
              Os 4 pilares essenciais da sua solução com IA
            </p>
          </div>
          <FrameworkQuadrants framework={solutionData.framework_mapping} />
        </LiquidGlassCard>
      </motion.div>

      {/* 🔴 TESTE: Card Simplificado MOVIDO AQUI */}
      <div style={{ 
        border: '5px solid red', 
        padding: '40px', 
        margin: '40px 0',
        backgroundColor: 'yellow',
        minHeight: '200px',
        zIndex: 9999,
        position: 'relative'
      }}>
        <h1 style={{ fontSize: '32px', color: 'black' }}>
          🎓 CARD MOVIDO PARA CIMA - VOCÊ VÊ AGORA?
        </h1>
        <p style={{ fontSize: '20px', color: 'black', marginTop: '20px' }}>
          Este é o MESMO card, mas movido para logo após o Framework!
        </p>
        <p style={{ fontSize: '16px', color: 'black', marginTop: '10px' }}>
          Solution ID: {solutionData?.id || 'N/A'}
        </p>
      </div>

      {/* Arquitetura Visual (Fluxograma) - 3º Bloco - ON DEMAND */}
      {(solutionData.architecture_flowchart || true) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LiquidGlassCard className="p-6">
            <button
              onClick={() => toggleSection('architecture')}
              className="w-full flex items-center justify-between mb-4 group"
            >
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                  Arquitetura da Solução
                </h3>
                <p className="text-sm text-muted-foreground">
                  Fluxograma técnico completo da solução de ponta a ponta
                </p>
              </div>
              {isExpanded('architecture') ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </button>
            
            <AnimatePresence mode="wait">
              {isExpanded('architecture') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLoading('architecture') ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ArchitectureFlowchart flowchart={solutionData.architecture_flowchart} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </LiquidGlassCard>
        </motion.div>
      )}

      {/* Ferramentas Necessárias - ON DEMAND */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <LiquidGlassCard className="p-6">
          <button
            onClick={() => toggleSection('tools')}
            className="w-full flex items-center justify-between mb-4 group"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                Ferramentas Necessárias
              </h3>
              <p className="text-sm text-muted-foreground">
                Recursos essenciais e opcionais para implementação
              </p>
            </div>
            {isExpanded('tools') ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </button>
          
          <AnimatePresence mode="wait">
            {isExpanded('tools') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isLoading('tools') ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <RequiredToolsGrid tools={solutionData.required_tools} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </LiquidGlassCard>
      </motion.div>

      {/* Checklist de Implementação - ON DEMAND */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <LiquidGlassCard className="p-6">
          <button
            onClick={() => toggleSection('checklist')}
            className="w-full flex items-center justify-between mb-4 group"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                Plano de Ação
              </h3>
              <p className="text-sm text-muted-foreground">
                Passos práticos para transformar sua ideia em realidade
              </p>
            </div>
            {isExpanded('checklist') ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </button>
          
          <AnimatePresence mode="wait">
            {isExpanded('checklist') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isLoading('checklist') ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <UnifiedChecklistTab 
                    solutionId={solutionData.id}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </LiquidGlassCard>
      </motion.div>

      {/* Prompt Lovable - ON DEMAND */}
      {(solutionData.lovable_prompt || true) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LiquidGlassCard className="p-6">
            <button
              onClick={() => toggleSection('lovable')}
              className="w-full flex items-center justify-between mb-4 group"
            >
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                  Prompt Lovable
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cole este prompt no Lovable para criar sua aplicação
                </p>
              </div>
              {isExpanded('lovable') ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </button>
            
            <AnimatePresence mode="wait">
              {isExpanded('lovable') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLoading('lovable') ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="relative">
                      <pre className="bg-surface-elevated/50 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{solutionData.lovable_prompt}</code>
                      </pre>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(solutionData.lovable_prompt);
                          toast.success('Prompt copiado!');
                        }}
                        className="absolute top-4 right-4"
                        size="sm"
                      >
                        Copiar
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </LiquidGlassCard>
        </motion.div>
      )}

    </motion.div>
  );
};
