import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import UnifiedChecklistTab from '@/components/unified-checklist/UnifiedChecklistTab';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function BuilderSolutionChecklist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  // Verificar se já existe checklist unificado
  const { data: existingChecklist } = useQuery({
    queryKey: ['unified-checklist-exists', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_checklists')
        .select('id')
        .eq('solution_id', id)
        .eq('checklist_type', 'implementation')
        .eq('is_template', false)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Mutation para migrar dados do formato antigo para o novo
  const migrateMutation = useMutation({
    mutationFn: async () => {
      if (!solution?.implementation_checklist || !id) return;

      // Transformar itens do formato antigo para o novo
      const migratedItems = solution.implementation_checklist.map((item: any, idx: number) => ({
        id: `step-${item.step_number || idx + 1}`,
        title: item.title,
        description: item.description,
        completed: false,
        column: 'todo',
        order: idx,
        notes: '',
        metadata: {
          estimated_time: item.estimated_time,
          difficulty: item.difficulty,
          resources: item.resources,
          common_pitfalls: item.common_pitfalls
        }
      }));

      const { data, error } = await supabase
        .from('unified_checklists')
        .insert({
          solution_id: id,
          checklist_type: 'implementation',
          is_template: false,
          checklist_data: {
            items: migratedItems,
            lastUpdated: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-checklist-exists', id] });
      toast.success('Checklist migrado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao migrar checklist:', error);
      toast.error('Erro ao migrar checklist');
    },
  });

  // Migrar automaticamente se necessário
  React.useEffect(() => {
    if (solution?.implementation_checklist && !existingChecklist && !migrateMutation.isPending) {
      migrateMutation.mutate();
    }
  }, [solution, existingChecklist]);

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
              onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para visão geral
            </Button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Plano de Ação
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Checklist prático e passo a passo para transformar sua ideia em realidade
              </p>
            </div>

            <UnifiedChecklistTab
              solutionId={id || ''}
              checklistType="implementation"
              onComplete={() => {
                toast.success('Parabéns! Você completou todos os passos!');
              }}
            />
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
