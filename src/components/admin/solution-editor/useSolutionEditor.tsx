
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase, Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stepSaving, setStepSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 6;
  const stepTitles = [
    "Informações Básicas",
    "Ferramentas",
    "Materiais",
    "Vídeos",
    "Checklist",
    "Publicar"
  ];

  // Default values para formulário
  const [currentValues, setCurrentValues] = useState<SolutionFormValues>({
    title: "",
    description: "",
    category: "Receita",
    difficulty: "easy",
    thumbnail_url: "",
    published: false,
    slug: ""
  });

  // Carregar solução
  useEffect(() => {
    const loadSolution = async () => {
      if (!id || id === "new") {
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
        setCurrentValues({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "Receita",
          difficulty: data.difficulty || "easy",
          thumbnail_url: data.thumbnail_url || "",
          published: data.published || false,
          slug: data.slug || ""
        });

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

    loadSolution();
  }, [id, toast]);

  // Função para salvar dados básicos
  const onSubmit = async (values: SolutionFormValues) => {
    try {
      setSaving(true);

      if (id === "new" || !solution) {
        const { data, error } = await supabase
          .from("solutions")
          .insert([{
            ...values,
            created_by: user?.id
          }])
          .select()
          .single();

        if (error) throw error;

        setSolution(data);
        setCurrentValues(values);
        navigate(`/admin/solutions/${data.id}`, { replace: true });
      } else {
        const { error } = await supabase
          .from("solutions")
          .update(values)
          .eq("id", solution.id);

        if (error) throw error;

        setSolution(prev => prev ? { ...prev, ...values } : prev);
        setCurrentValues(values);
      }

      toast({
        title: "Solução salva",
        description: "As informações foram salvas com sucesso."
      });

    } catch (error) {
      console.error("❌ Erro ao salvar solução:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a solução.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Função para salvar etapa atual (com timeout reduzido)
  const handleSaveCurrentStep = useCallback(async () => {
    if (currentStep === 0) {
      // Na etapa 0, não há necessidade de salvar via eventos
      return;
    }

    try {
      setStepSaving(true);

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout ao salvar etapa"));
        }, 5000);

        const handleStepSaved = (event: CustomEvent) => {
          clearTimeout(timeout);
          
          if (event.detail.success) {
            resolve();
          } else {
            reject(new Error(event.detail.error || "Erro ao salvar etapa"));
          }
        };

        window.addEventListener('tools-saved', handleStepSaved as EventListener, { once: true });

        if (currentStep === 1) {
          window.dispatchEvent(new CustomEvent('save-tools-step'));
        }
      });

    } catch (error) {
      console.error("❌ Erro ao salvar etapa atual:", error);
      throw error;
    } finally {
      setStepSaving(false);
    }
  }, [currentStep]);

  // Função para avançar para próxima etapa
  const handleNextStep = useCallback(async () => {
    if (currentStep >= totalSteps - 1) return;

    try {
      if (currentStep > 0) {
        await handleSaveCurrentStep();
      }
      
      setCurrentStep(currentStep + 1);
      
    } catch (error) {
      console.error("❌ Erro ao avançar etapa:", error);
      toast({
        title: "Erro ao avançar",
        description: "Ocorreu um erro ao salvar os dados da etapa atual.",
        variant: "destructive"
      });
    }
  }, [currentStep, totalSteps, handleSaveCurrentStep, toast]);

  return {
    solution,
    loading,
    saving: saving || stepSaving, // Unificar estados de loading
    activeTab,
    setActiveTab,
    onSubmit,
    currentValues,
    currentStep,
    setCurrentStep,
    totalSteps,
    stepTitles,
    handleNextStep,
    handleSaveCurrentStep
  };
};
