
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { useNavigate } from "react-router-dom";
import { Solution } from "@/types/supabaseTypes";

export const useSolutionEditor = (solutionId: string | undefined, user: any) => {
  const { log, logError } = useLogging("useSolutionEditor");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [currentValues, setCurrentValues] = useState<SolutionFormValues>({
    title: "",
    description: "",
    category: "revenue",
    difficulty: "medium",
    thumbnail_url: "",
    published: false,
    slug: ""
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Define os passos do editor
  const totalSteps = 7;
  const stepTitles = [
    "Informações Básicas",
    "Ferramentas",
    "Materiais",
    "Vídeos",
    "Módulos",
    "Checklist",
    "Publicação"
  ];

  // Carregar dados da solução quando o ID mudar
  useEffect(() => {
    const fetchSolutionData = async () => {
      if (!solutionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        log("Carregando dados da solução", { solutionId });

        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", solutionId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setSolution(data);
          log("Solução carregada com sucesso", { data });
          
          setCurrentValues({
            title: data.title || "",
            description: data.description || "",
            category: data.category || "revenue",
            difficulty: data.difficulty || "medium",
            thumbnail_url: data.thumbnail_url || "",
            published: data.published || false,
            slug: data.slug || ""
          });
        }
      } catch (error) {
        logError("Erro ao carregar solução", { error });
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados da solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSolutionData();
  }, [solutionId, log, logError, toast]);

  // Função para salvar alterações
  const onSubmit = async (formValues: SolutionFormValues) => {
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para editar uma solução.",
        variant: "destructive"
      });
      return Promise.reject(new Error("Não autenticado"));
    }

    setSaving(true);

    try {
      log("Salvando alterações na solução", { values: formValues });

      // Atualizar valores atuais
      setCurrentValues(formValues);

      const updateData = {
        ...formValues,
        updated_at: new Date().toISOString()
      };

      if (solutionId) {
        // Atualizar solução existente
        const { error } = await supabase
          .from("solutions")
          .update(updateData)
          .eq("id", solutionId);

        if (error) throw error;

        log("Solução atualizada com sucesso");
        setSolution(prev => ({ ...prev, ...updateData } as Solution));
      } else {
        // Criar nova solução
        const { data, error } = await supabase
          .from("solutions")
          .insert([updateData])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          log("Nova solução criada", { id: data[0].id });
          setSolution(data[0]);
          navigate(`/admin/solutions/${data[0].id}`);
        }
      }

      return Promise.resolve();
    } catch (error) {
      logError("Erro ao salvar solução", { error });
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar salvar as alterações.",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setSaving(false);
    }
  };

  // Ao mudar de etapa, também atualiza a aba ativa
  useEffect(() => {
    const tabs = ["basic", "tools", "resources", "video", "modules", "checklist", "publish"];
    if (tabs[currentStep]) {
      setActiveTab(tabs[currentStep]);
    }
  }, [currentStep]);

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
    stepTitles
  };
};
