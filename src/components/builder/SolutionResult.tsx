import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Share2, Download, FileCode, Package, ListChecks, Network, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { FrameworkQuadrants } from './FrameworkQuadrants';
import { RequiredToolsGrid } from './RequiredToolsGrid';
import UnifiedChecklistTab from '@/components/unified-checklist/UnifiedChecklistTab';
import { ArchitectureFlowchart } from './ArchitectureFlowchart';
import { LearningRecommendationsCard } from './LearningRecommendationsCard';
import { SolutionSectionCard } from './SolutionSectionCard';
import { PromptLovableModal } from './PromptLovableModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface SolutionResultProps {
  solution: any;
  onNewIdea: () => void;
}

export const SolutionResult: React.FC<SolutionResultProps> = ({ 
  solution, 
  onNewIdea
}) => {
  // Estado para controlar expansão de seções on-demand
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set());
  const [solutionData, setSolutionData] = useState<any>(solution);
  
  // Estados para modais
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [architectureModalOpen, setArchitectureModalOpen] = useState(false);

  // 🔄 Sincronizar solutionData quando solution prop mudar (fix bug do piscando)
  useEffect(() => {
    setSolutionData(solution);
  }, [solution]);

  const generateSection = async (sectionType: string) => {
    // Mapear sectionId para campo do banco e tipo
    const sectionMapping: Record<string, { field: string; type: string }> = {
      'tools': { field: 'required_tools', type: 'tools' },
      'checklist': { field: 'implementation_checklist', type: 'checklist' },
      'architecture': { field: 'architecture_flowchart', type: 'architecture' },
      'lovable': { field: 'lovable_prompt', type: 'lovable' }
    };

    const mapping = sectionMapping[sectionType];
    
    setLoadingSections(prev => new Set([...prev, sectionType]));
    
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
        let contentToSave;
        
        if (mapping.type === 'lovable') {
          contentToSave = data.content.lovable_prompt || data.content;
        } else if (mapping.type === 'framework') {
          contentToSave = data.content.framework_quadrants || data.content;
        } else {
          contentToSave = data.content;
        }
        
        setSolutionData((prev: any) => ({
          ...prev,
          [mapping.field]: contentToSave
        }));
        
        toast.success('Conteúdo gerado com sucesso! 🎉');
      }
    } catch (err) {
      toast.error('Erro ao gerar conteúdo', {
        description: 'Tente novamente em instantes.'
      });
    } finally {
      setLoadingSections(prev => {
        const newSet = new Set(prev);
        newSet.delete(sectionType);
        return newSet;
      });
    }
  };

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

      {/* GRID DE CARDS DA CAPA - NORMALIZADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Card Arquitetura */}
        <SolutionSectionCard
          icon={<Network className="h-5 w-5 text-primary" />}
          title="Arquitetura da Solução"
          description="Fluxograma técnico completo"
          badge={
            isLoading('architecture') 
              ? 'Gerando...' 
              : solutionData.architecture_flowchart 
                ? '✓ Pronto' 
                : 'Gerar'
          }
          badgeVariant={
            isLoading('architecture') 
              ? 'loading' 
              : solutionData.architecture_flowchart 
                ? 'success' 
                : 'default'
          }
          loading={isLoading('architecture')}
          onClick={() => {
            if (!solutionData.architecture_flowchart) {
              generateSection('architecture');
            }
            setArchitectureModalOpen(true);
          }}
        />

        {/* Card Ferramentas */}
        <SolutionSectionCard
          icon={<Package className="h-5 w-5 text-primary" />}
          title="Ferramentas Necessárias"
          description="Recursos essenciais e opcionais"
          badge={
            isLoading('tools') 
              ? 'Gerando...' 
              : solutionData.required_tools 
                ? '✓ Pronto' 
                : 'Gerar'
          }
          badgeVariant={
            isLoading('tools') 
              ? 'loading' 
              : solutionData.required_tools 
                ? 'success' 
                : 'default'
          }
          loading={isLoading('tools')}
          onClick={() => {
            if (!solutionData.required_tools) {
              generateSection('tools');
            }
            setToolsModalOpen(true);
          }}
        />

        {/* Card Plano de Ação */}
        <SolutionSectionCard
          icon={<ListChecks className="h-5 w-5 text-primary" />}
          title="Plano de Ação"
          description="Passos práticos para implementar"
          badge={
            isLoading('checklist') 
              ? 'Gerando...' 
              : solutionData.implementation_checklist 
                ? '✓ Pronto' 
                : 'Gerar'
          }
          badgeVariant={
            isLoading('checklist') 
              ? 'loading' 
              : solutionData.implementation_checklist 
                ? 'success' 
                : 'default'
          }
          loading={isLoading('checklist')}
          onClick={() => {
            if (!solutionData.implementation_checklist) {
              generateSection('checklist');
            }
            setChecklistModalOpen(true);
          }}
        />

        {/* Card Prompt Lovable */}
        <SolutionSectionCard
          icon={<FileCode className="h-5 w-5 text-primary" />}
          title="Prompt Lovable"
          description="Cole e comece seu projeto agora"
          badge={
            isLoading('lovable') 
              ? 'Gerando...' 
              : solutionData.lovable_prompt 
                ? '✓ Pronto' 
                : 'Gerar'
          }
          badgeVariant={
            isLoading('lovable') 
              ? 'loading' 
              : solutionData.lovable_prompt 
                ? 'success' 
                : 'default'
          }
          loading={isLoading('lovable')}
          onClick={() => {
            if (!solutionData.lovable_prompt) {
              generateSection('lovable');
            }
            setPromptModalOpen(true);
          }}
        />
      </div>

      {/* Modal Prompt Lovable */}
      <PromptLovableModal
        open={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        prompt={solutionData.lovable_prompt}
        loading={isLoading('lovable')}
        onGenerate={() => generateSection('lovable')}
      />

      {/* Modal Arquitetura */}
      <Dialog open={architectureModalOpen} onOpenChange={setArchitectureModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Arquitetura da Solução</DialogTitle>
            <DialogDescription>
              Fluxograma técnico completo da solução de ponta a ponta
            </DialogDescription>
          </DialogHeader>
          {isLoading('architecture') ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : solutionData.architecture_flowchart ? (
            <ArchitectureFlowchart flowchart={solutionData.architecture_flowchart} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma arquitetura gerada ainda.</p>
              <Button onClick={() => generateSection('architecture')} className="mt-4">
                Gerar Arquitetura
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Ferramentas */}
      <Dialog open={toolsModalOpen} onOpenChange={setToolsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ferramentas Necessárias</DialogTitle>
            <DialogDescription>
              Recursos essenciais e opcionais para implementação
            </DialogDescription>
          </DialogHeader>
          {isLoading('tools') ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : solutionData.required_tools ? (
            <RequiredToolsGrid tools={solutionData.required_tools} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma ferramenta gerada ainda.</p>
              <Button onClick={() => generateSection('tools')} className="mt-4">
                Gerar Ferramentas
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Plano de Ação */}
      <Dialog open={checklistModalOpen} onOpenChange={setChecklistModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plano de Ação</DialogTitle>
            <DialogDescription>
              Passos práticos para transformar sua ideia em realidade
            </DialogDescription>
          </DialogHeader>
          {isLoading('checklist') ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : solutionData.implementation_checklist ? (
            <UnifiedChecklistTab solutionId={solutionData.id} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum checklist gerado ainda.</p>
              <Button onClick={() => generateSection('checklist')} className="mt-4">
                Gerar Checklist
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};
