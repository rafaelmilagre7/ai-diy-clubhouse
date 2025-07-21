
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Solution } from '@/lib/supabase';
import { SolutionFormValues } from '@/components/admin/solution/form/solutionFormSchema';
import { useToast } from '@/hooks/use-toast';

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [currentValues, setCurrentValues] = useState<SolutionFormValues>({
    title: "",
    description: "",
    difficulty: "easy",
    published: false,
    slug: "",
    tags: []
  });
  
  // Sistema de navegação por etapas
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 6;
  const stepTitles = [
    "Informações Básicas",
    "Ferramentas",
    "Materiais",
    "Vídeos",
    "Checklist",
    "Publicar"
  ];

  // Sistema de callbacks para salvamento de etapas
  const [stepSaveFunctions, setStepSaveFunctions] = useState<Map<number, () => Promise<void>>>(new Map());

  console.log("🚀 useSolutionEditor: Inicializando com ID:", id);
  console.log("📍 useSolutionEditor: CurrentStep:", currentStep);
  console.log("🔧 useSolutionEditor: StepSaveFunctions size:", stepSaveFunctions.size);

  // Query para buscar a solução
  const { data: solution, isLoading: loading } = useQuery({
    queryKey: ['solution', id],
    queryFn: async () => {
      if (!id) return null;
      
      console.log("🔍 useSolutionEditor: Buscando solução:", id);
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("❌ useSolutionEditor: Erro ao buscar solução:", error);
        throw error;
      }
      
      console.log("✅ useSolutionEditor: Solução encontrada:", data);
      return data as Solution;
    },
    enabled: !!id && !!user,
  });

  // Atualizar currentValues quando a solução for carregada
  useEffect(() => {
    if (solution) {
      console.log("🔄 useSolutionEditor: Atualizando currentValues com dados da solução");
      setCurrentValues({
        title: solution.title || "",
        description: solution.description || "",
        difficulty: solution.difficulty || "easy",
        category: solution.category as any,
        thumbnail_url: solution.thumbnail_url || "",
        published: solution.published || false,
        slug: solution.slug || "",
        tags: solution.tags || []
      });
    }
  }, [solution]);

  // Mutation para salvar a solução
  const saveMutation = useMutation({
    mutationFn: async (values: SolutionFormValues) => {
      console.log("💾 useSolutionEditor: Salvando solução com valores:", values);
      
      if (!id) {
        console.error("❌ useSolutionEditor: ID não encontrado para salvamento");
        throw new Error('Solution ID is required');
      }

      const { data, error } = await supabase
        .from('solutions')
        .update({
          title: values.title,
          description: values.description,
          difficulty: values.difficulty,
          category: values.category,
          thumbnail_url: values.thumbnail_url,
          published: values.published,
          slug: values.slug,
          tags: values.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("❌ useSolutionEditor: Erro ao salvar:", error);
        throw error;
      }

      console.log("✅ useSolutionEditor: Solução salva com sucesso:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("🎉 useSolutionEditor: Salvamento concluído");
      queryClient.setQueryData(['solution', id], data);
      setCurrentValues(prev => ({ ...prev, ...data }));
      toast({
        title: "Sucesso",
        description: "Solução salva com sucesso!"
      });
    },
    onError: (error) => {
      console.error("💥 useSolutionEditor: Erro na mutation:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar a solução",
        variant: "destructive"
      });
    }
  });

  // Função principal de submit
  const onSubmit = async (values: SolutionFormValues) => {
    console.log("📝 useSolutionEditor: onSubmit chamado com:", values);
    setSaving(true);
    try {
      await saveMutation.mutateAsync(values);
      setCurrentValues(values);
    } finally {
      setSaving(false);
    }
  };

  // Função para registrar callbacks de salvamento por etapa
  const handleStepSaveRegistration = useCallback((stepSaveFunction: () => Promise<void>) => {
    console.log("📋 useSolutionEditor: Registrando função de salvamento para etapa:", currentStep);
    setStepSaveFunctions(prev => {
      const newMap = new Map(prev);
      newMap.set(currentStep, stepSaveFunction);
      console.log("📋 useSolutionEditor: Map atualizado, size:", newMap.size);
      return newMap;
    });
  }, [currentStep]);

  // Função para salvar a etapa atual
  const handleSaveCurrentStep = async () => {
    console.log("💾 useSolutionEditor: handleSaveCurrentStep chamado para etapa:", currentStep);
    console.log("🔧 useSolutionEditor: Funções disponíveis:", Array.from(stepSaveFunctions.keys()));
    
    const saveFunction = stepSaveFunctions.get(currentStep);
    if (saveFunction) {
      console.log("✅ useSolutionEditor: Executando função registrada");
      await saveFunction();
    } else {
      console.log("⚠️ useSolutionEditor: Nenhuma função registrada para esta etapa");
    }
  };

  // Função para avançar para próxima etapa
  const handleNextStep = async () => {
    console.log("➡️ useSolutionEditor: handleNextStep chamado");
    
    try {
      // Salvar etapa atual
      await handleSaveCurrentStep();
      
      // Avançar para próxima etapa
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
        console.log("📍 useSolutionEditor: Avançado para etapa:", currentStep + 1);
      }
    } catch (error) {
      console.error("❌ useSolutionEditor: Erro ao avançar etapa:", error);
      throw error;
    }
  };

  return {
    solution,
    loading,
    saving: saving || saveMutation.isPending,
    activeTab,
    setActiveTab,
    onSubmit,
    currentValues,
    setCurrentValues,
    currentStep,
    setCurrentStep,
    totalSteps,
    stepTitles,
    handleNextStep,
    handleSaveCurrentStep,
    handleStepSaveRegistration
  };
};
