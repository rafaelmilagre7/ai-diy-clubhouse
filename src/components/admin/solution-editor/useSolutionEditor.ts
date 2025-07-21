
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase, Solution } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

export const useSolutionEditor = (id: string | undefined, user: User | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [currentStep, setCurrentStep] = useState(0);
  const [currentValues, setCurrentValues] = useState<SolutionFormValues>({
    title: "",
    description: "",
    category: undefined,
    difficulty: "easy",
    thumbnail_url: "",
    published: false,
    slug: "",
    tags: []
  });
  
  // Ref para rastrear se os dados foram carregados
  const dataLoadedRef = useRef(false);
  
  // Map para armazenar funções de salvamento por etapa
  const stepSaveFunctions = useRef(new Map<number, () => Promise<void>>());
  
  const totalSteps = 6;
  const stepTitles = [
    "Informações Básicas",
    "Ferramentas",
    "Materiais",
    "Vídeos", 
    "Checklist",
    "Publicar"
  ];

  console.log("🚀 useSolutionEditor: Inicializando com ID:", id);
  console.log("📍 useSolutionEditor: CurrentStep:", currentStep);
  console.log("🔧 useSolutionEditor: StepSaveFunctions size:", stepSaveFunctions.current.size);

  // Buscar dados da solução
  const fetchSolution = useCallback(async () => {
    if (!id || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("📡 useSolutionEditor: Buscando solução com ID:", id);
      
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("❌ useSolutionEditor: Erro ao buscar solução:", error);
        throw error;
      }

      if (data) {
        console.log("✅ useSolutionEditor: Solução carregada:", data);
        setSolution(data as Solution);
        
        // Atualizar currentValues com os dados da solução
        const solutionValues: SolutionFormValues = {
          title: data.title || "",
          description: data.description || "",
          category: data.category as any,
          difficulty: data.difficulty as "easy" | "medium" | "advanced",
          thumbnail_url: data.thumbnail_url || "",
          published: data.published || false,
          slug: data.slug || "",
          tags: data.tags || []
        };
        
        console.log("🔄 useSolutionEditor: Atualizando currentValues:", solutionValues);
        setCurrentValues(solutionValues);
        dataLoadedRef.current = true;
      } else {
        console.log("⚠️ useSolutionEditor: Solução não encontrada");
        toast({
          title: "Solução não encontrada",
          description: "Não foi possível encontrar a solução solicitada.",
          variant: "destructive"
        });
        navigate("/admin/solutions");
      }
    } catch (error: any) {
      console.error("❌ useSolutionEditor: Erro geral:", error);
      toast({
        title: "Erro ao carregar solução",
        description: "Ocorreu um erro ao carregar os dados da solução.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate, toast]);

  // Carregar dados na inicialização
  useEffect(() => {
    fetchSolution();
  }, [fetchSolution]);

  // Função para submeter o formulário
  const onSubmit = useCallback(async (values: SolutionFormValues) => {
    if (!id || !user) return;

    try {
      setSaving(true);
      console.log("📝 useSolutionEditor: Salvando valores:", values);

      const { error } = await supabase
        .from("solutions")
        .update({
          title: values.title,
          description: values.description,
          category: values.category,
          difficulty: values.difficulty,
          thumbnail_url: values.thumbnail_url,
          published: values.published,
          slug: values.slug,
          tags: values.tags,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) {
        console.error("❌ useSolutionEditor: Erro ao salvar:", error);
        throw error;
      }

      // Atualizar currentValues com os novos dados
      setCurrentValues(values);
      
      // Recarregar dados da solução
      await fetchSolution();
      
      console.log("✅ useSolutionEditor: Solução salva com sucesso");
      
      toast({
        title: "Solução salva",
        description: "As informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error("❌ useSolutionEditor: Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a solução.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [id, user, toast, fetchSolution]);

  // Registrar função de salvamento para uma etapa
  const handleStepSaveRegistration = useCallback((stepSaveFunction: () => Promise<void>) => {
    console.log("📝 useSolutionEditor: Registrando função de salvamento para etapa:", currentStep);
    stepSaveFunctions.current.set(currentStep, stepSaveFunction);
  }, [currentStep]);

  // Salvar dados da etapa atual
  const handleSaveCurrentStep = useCallback(async () => {
    const saveFunction = stepSaveFunctions.current.get(currentStep);
    if (saveFunction) {
      console.log("💾 useSolutionEditor: Executando salvamento da etapa:", currentStep);
      await saveFunction();
    } else {
      console.log("⚠️ useSolutionEditor: Nenhuma função de salvamento registrada para etapa:", currentStep);
    }
  }, [currentStep]);

  // Avançar para próxima etapa
  const handleNextStep = useCallback(async () => {
    console.log("▶️ useSolutionEditor: Avançando da etapa:", currentStep);
    
    try {
      // Salvar dados da etapa atual antes de avançar
      await handleSaveCurrentStep();
      
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
        console.log("✅ useSolutionEditor: Avançou para etapa:", currentStep + 1);
      }
    } catch (error) {
      console.error("❌ useSolutionEditor: Erro ao avançar etapa:", error);
      throw error;
    }
  }, [currentStep, totalSteps, handleSaveCurrentStep]);

  return {
    solution,
    loading: loading || !dataLoadedRef.current, // Só considera carregado quando os dados estiverem prontos
    saving,
    activeTab,
    setActiveTab,
    onSubmit,
    currentValues,
    setCurrentValues, // Expor para permitir atualizações externas
    currentStep,
    setCurrentStep,
    totalSteps,
    stepTitles,
    handleNextStep,
    handleSaveCurrentStep,
    handleStepSaveRegistration
  };
};
