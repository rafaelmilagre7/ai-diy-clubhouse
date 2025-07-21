
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase/types";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const { toast } = useToast();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [currentStep, setCurrentStep] = useState(0);
  
  // Valores padrão corrigidos
  const [currentValues, setCurrentValues] = useState<SolutionFormValues>({
    title: "",
    description: "",
    category: "Receita", // Valor padrão válido
    difficulty: "easy",
    thumbnail_url: "",
    published: false,
    slug: "",
    tags: [], // Campo tags adicionado
  });

  // Função para registrar callbacks de salvamento por etapa
  const [stepSaveFunctions, setStepSaveFunctions] = useState<Record<number, () => Promise<void>>>({});

  const handleStepSaveRegistration = useCallback((stepSaveFunction: () => Promise<void>) => {
    console.log("🔄 useSolutionEditor: Registrando função de salvamento para etapa:", currentStep);
    setStepSaveFunctions(prev => ({
      ...prev,
      [currentStep]: stepSaveFunction
    }));
  }, [currentStep]);

  const stepTitles = [
    "Informações Básicas",
    "Ferramentas",
    "Materiais",
    "Vídeos",
    "Checklist",
    "Publicar"
  ];

  const totalSteps = stepTitles.length;

  useEffect(() => {
    if (id && id !== "new") {
      fetchSolution(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchSolution = async (solutionId: string) => {
    try {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("id", solutionId)
        .single();

      if (error) throw error;

      setSolution(data);
      setCurrentValues({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "Receita",
        difficulty: data.difficulty || "easy",
        thumbnail_url: data.thumbnail_url || "",
        published: data.published || false,
        slug: data.slug || "",
        tags: data.tags || [],
      });
    } catch (error: any) {
      console.error("Erro ao buscar solução:", error);
      toast({
        title: "Erro ao carregar solução",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: SolutionFormValues) => {
    try {
      setSaving(true);
      
      const solutionData = {
        title: values.title,
        description: values.description,
        category: values.category || "Receita",
        difficulty: values.difficulty,
        thumbnail_url: values.thumbnail_url || null,
        published: values.published || false,
        slug: values.slug || values.title.toLowerCase().replace(/\s+/g, "-"),
        tags: values.tags || [],
      };

      if (id && id !== "new") {
        const { data, error } = await supabase
          .from("solutions")
          .update(solutionData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        setSolution(data);
      } else {
        const { data, error } = await supabase
          .from("solutions")
          .insert([solutionData])
          .select()
          .single();

        if (error) throw error;
        setSolution(data);
        
        window.history.replaceState(null, "", `/admin/solutions/${data.id}`);
      }

      setCurrentValues(values);
      
      toast({
        title: "Solução salva",
        description: "As informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar solução:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCurrentStep = async () => {
    console.log("💾 useSolutionEditor: Salvando etapa atual:", currentStep);
    const stepSaveFunction = stepSaveFunctions[currentStep];
    
    if (stepSaveFunction) {
      console.log("✅ useSolutionEditor: Executando função de salvamento da etapa");
      await stepSaveFunction();
    } else {
      console.log("⚠️ useSolutionEditor: Nenhuma função de salvamento registrada para etapa", currentStep);
    }
  };

  const handleNextStep = async () => {
    try {
      console.log("🚀 useSolutionEditor: handleNextStep chamado na etapa:", currentStep);
      
      // Salvar dados da etapa atual antes de avançar
      await handleSaveCurrentStep();
      
      if (currentStep < totalSteps - 1) {
        console.log("➡️ useSolutionEditor: Avançando para próxima etapa");
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("❌ useSolutionEditor: Erro no handleNextStep:", error);
      throw error;
    }
  };

  return {
    solution,
    loading,
    saving,
    activeTab,
    setActiveTab,
    onSubmit,
    currentValues,
    currentStep,
    setCurrentStep,
    totalSteps,
    stepTitles,
    handleNextStep,
    handleSaveCurrentStep,
    handleStepSaveRegistration,
  };
};
