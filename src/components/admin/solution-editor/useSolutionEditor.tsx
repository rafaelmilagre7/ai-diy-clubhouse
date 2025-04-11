
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { moduleTypes } from "@/components/admin/solution/moduleTypes";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Step management for the wizard-like interface
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 10; // Total number of steps in the solution creation process

  // Títulos das etapas
  const stepTitles = [
    "Configuração Básica",
    "Landing da Solução", 
    "Visão Geral e Case",
    "Preparação Express",
    "Implementação Passo a Passo",
    "Verificação de Implementação",
    "Primeiros Resultados",
    "Otimização Rápida", 
    "Celebração e Próximos Passos",
    "Revisão e Publicação"
  ];
  
  const defaultValues: SolutionFormValues = {
    title: "",
    description: "",
    category: "revenue" as const,
    difficulty: "medium" as const,
    thumbnail_url: "",
    published: false,
    slug: "",
  };
  
  useEffect(() => {
    const fetchSolution = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setSolution(data as Solution);
      } catch (error) {
        console.error("Error fetching solution:", error);
        toast({
          title: "Erro ao carregar solução",
          description: "Ocorreu um erro ao tentar carregar os detalhes da solução.",
          variant: "destructive",
        });
        navigate("/admin/solutions");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolution();
  }, [id, toast, navigate]);
  
  const onSubmit = async (values: SolutionFormValues) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Gerar um slug a partir do título se não for fornecido
      const slug = values.slug || slugify(values.title);
      
      // Preparar dados para salvar, incluindo campos obrigatórios
      const solutionData = {
        title: values.title,
        description: values.description,
        category: values.category,
        difficulty: values.difficulty,
        slug: slug,
        thumbnail_url: values.thumbnail_url || null,
        published: values.published,
        updated_at: new Date().toISOString(),
      };
      
      if (id) {
        const { error } = await supabase
          .from("solutions")
          .update(solutionData)
          .eq("id", id);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Solução atualizada",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        const newSolution = {
          ...solutionData,
          created_at: new Date().toISOString(),
        };
        
        const { data, error } = await supabase
          .from("solutions")
          .insert(newSolution)
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        setSolution(data as Solution);
        
        toast({
          title: "Solução criada",
          description: "A nova solução foi criada com sucesso.",
        });
        
        navigate(`/admin/solutions/${data.id}`);
      }
    } catch (error) {
      console.error("Error saving solution:", error);
      toast({
        title: "Erro ao salvar solução",
        description: "Ocorreu um erro ao tentar salvar a solução.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const currentValues: SolutionFormValues = solution
    ? {
        title: solution.title,
        description: solution.description,
        category: solution.category as "revenue" | "operational" | "strategy",
        difficulty: solution.difficulty as "easy" | "medium" | "advanced",
        thumbnail_url: solution.thumbnail_url || "",
        published: solution.published,
        slug: solution.slug,
      }
    : defaultValues;

  // Update activeTab based on currentStep
  useEffect(() => {
    if (currentStep === 0) {
      setActiveTab("basic");
    } else if (currentStep >= 1 && currentStep <= 8) {
      setActiveTab("modules");
    } else if (currentStep === 9) {
      setActiveTab("resources");
    }
  }, [currentStep]);

  // Função para slugificar strings
  const slugify = (text: string): string => {
    return text
      .toString()
      .normalize('NFD')           // normaliza os caracteres decompostos
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')       // substitui espaços por -
      .replace(/[^\w\-]+/g, '')   // remove caracteres não-palavra
      .replace(/\-\-+/g, '-')     // substitui múltiplos hifens por um único
      .replace(/^-+/, '')         // remove hifens do início
      .replace(/-+$/, '');        // remove hifens do final
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
    stepTitles
  };
};
