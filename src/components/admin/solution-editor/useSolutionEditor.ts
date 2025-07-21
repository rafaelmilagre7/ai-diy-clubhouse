
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Solution } from "@/lib/supabase";
import { SolutionFormValues, solutionFormSchema } from "@/components/admin/solution/form/solutionFormSchema";
import { useToast } from "@/hooks/use-toast";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [currentStep, setCurrentStep] = useState(0);
  
  // Armazenar função de salvamento da etapa atual
  const currentStepSaveFunction = useRef<(() => Promise<void>) | null>(null);

  const form = useForm<SolutionFormValues>({
    resolver: zodResolver(solutionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "medium",
      category: "",
      tags: []
    }
  });

  const stepTitles = [
    "Informações Básicas",
    "Ferramentas", 
    "Materiais",
    "Vídeos",
    "Checklist",
    "Publicar"
  ];
  const totalSteps = stepTitles.length;

  console.log("🚀 useSolutionEditor: Hook inicializado");
  console.log("📍 useSolutionEditor: ID =", id);
  console.log("📍 useSolutionEditor: currentStep =", currentStep);
  console.log("🔧 useSolutionEditor: currentStepSaveFunction disponível =", !!currentStepSaveFunction.current);

  // Função para registrar a função de salvamento da etapa atual
  const handleStepSaveRegistration = useCallback((saveFunction: () => Promise<void>) => {
    console.log("🔧 useSolutionEditor: REGISTRANDO função de salvamento");
    console.log("🔧 useSolutionEditor: currentStep =", currentStep);
    console.log("🔧 useSolutionEditor: saveFunction recebida =", !!saveFunction);
    
    currentStepSaveFunction.current = saveFunction;
    
    console.log("✅ useSolutionEditor: Função registrada com sucesso");
  }, [currentStep]);

  // Carregar solução existente
  useEffect(() => {
    const fetchSolution = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setSolution(data);
        if (data) {
          form.reset({
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            category: data.category || "",
            tags: data.tags || []
          });
        }
      } catch (error) {
        console.error("Erro ao carregar solução:", error);
        toast({
          title: "Erro ao carregar solução",
          description: "Não foi possível carregar os dados da solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [id, form, toast]);

  // Função de submit principal
  const onSubmit = async (values: SolutionFormValues) => {
    try {
      setSaving(true);
      console.log("💾 useSolutionEditor: Salvando dados básicos:", values);

      if (id) {
        // Atualizar solução existente
        const { data, error } = await supabase
          .from("solutions")
          .update({
            title: values.title,
            description: values.description,
            difficulty: values.difficulty,
            category: values.category,
            tags: values.tags,
            updated_at: new Date().toISOString()
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        setSolution(data);
      } else {
        // Criar nova solução
        if (!user?.id) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
          .from("solutions")
          .insert({
            title: values.title,
            description: values.description,
            difficulty: values.difficulty,
            category: values.category,
            tags: values.tags,
            created_by: user.id
          })
          .select()
          .single();

        if (error) throw error;
        setSolution(data);
        
        // Navegar para a URL com ID após criar
        navigate(`/admin/solutions/${data.id}`, { replace: true });
      }

      console.log("✅ useSolutionEditor: Dados básicos salvos com sucesso");
    } catch (error) {
      console.error("❌ useSolutionEditor: Erro ao salvar:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Salvar dados da etapa atual
  const handleSaveCurrentStep = async () => {
    console.log("💾 useSolutionEditor: handleSaveCurrentStep chamado");
    console.log("📍 useSolutionEditor: currentStep =", currentStep);
    console.log("🔧 useSolutionEditor: Função disponível =", !!currentStepSaveFunction.current);
    
    if (currentStepSaveFunction.current) {
      console.log("🚀 useSolutionEditor: Executando função de salvamento da etapa");
      await currentStepSaveFunction.current();
      console.log("✅ useSolutionEditor: Função de salvamento executada");
    } else {
      console.log("⚠️ useSolutionEditor: Nenhuma função de salvamento registrada");
    }
  };

  // Avançar para próxima etapa
  const handleNextStep = async () => {
    console.log("🚀 useSolutionEditor: handleNextStep chamado");
    console.log("📍 useSolutionEditor: currentStep =", currentStep);
    
    try {
      // Salvar dados da etapa atual antes de avançar
      await handleSaveCurrentStep();
      
      if (currentStep < totalSteps - 1) {
        const nextStep = currentStep + 1;
        console.log("➡️ useSolutionEditor: Avançando para etapa", nextStep);
        setCurrentStep(nextStep);
        
        // Limpar a função de salvamento ao mudar de etapa
        currentStepSaveFunction.current = null;
        console.log("🔄 useSolutionEditor: Função de salvamento limpa para nova etapa");
      }
    } catch (error) {
      console.error("❌ useSolutionEditor: Erro ao avançar etapa:", error);
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
    currentValues: form.watch(),
    currentStep,
    setCurrentStep,
    totalSteps,
    stepTitles,
    handleNextStep,
    handleSaveCurrentStep,
    handleStepSaveRegistration
  };
};
