
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase, Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { createUniqueSlug } from "@/utils/solutionUtils";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados principais
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");

  // Configurações das etapas
  const totalSteps = 7;
  const stepTitles = [
    "Informações Básicas",
    "Ferramentas Necessárias", 
    "Materiais de Apoio",
    "Vídeo-aulas",
    "Módulos",
    "Checklist de Implementação",
    "Publicação"
  ];

  // Valores padrão do formulário
  const defaultValues: SolutionFormValues = {
    title: "",
    description: "",
    category: "Receita" as const,
    difficulty: "medium" as const,
    thumbnail_url: "",
    published: false,
    slug: "",
  };

  // Valores atuais baseados na solução carregada
  const currentValues: SolutionFormValues = solution
    ? {
        title: solution.title,
        description: solution.description,
        category: solution.category as "Receita" | "Operacional" | "Estratégia",
        difficulty: solution.difficulty as "easy" | "medium" | "advanced",
        thumbnail_url: solution.thumbnail_url || "",
        published: solution.published,
        slug: solution.slug,
      }
    : defaultValues;

  // Carregar solução existente
  useEffect(() => {
    const fetchSolution = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao carregar solução:", error);
          toast({
            title: "Erro ao carregar",
            description: "Não foi possível carregar a solução.",
            variant: "destructive"
          });
          navigate("/admin/solutions");
          return;
        }

        if (data) {
          setSolution(data as Solution);
          console.log("Solução carregada:", data);
        } else {
          console.log("Solução não encontrada");
          toast({
            title: "Solução não encontrada",
            description: "A solução solicitada não existe.",
            variant: "destructive"
          });
          navigate("/admin/solutions");
        }
      } catch (error: any) {
        console.error("Erro ao buscar solução:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao carregar a solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [id, navigate, toast]);

  // Função de salvamento
  const onSubmit = async (values: SolutionFormValues): Promise<void> => {
    try {
      setSaving(true);
      
      if (id && solution) {
        // Atualizar solução existente
        const { data, error } = await supabase
          .from("solutions")
          .update({
            title: values.title,
            description: values.description,
            category: values.category,
            difficulty: values.difficulty,
            thumbnail_url: values.thumbnail_url,
            published: values.published,
            slug: values.slug || createUniqueSlug(values.title),
            updated_at: new Date().toISOString()
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        setSolution(data as Solution);
        console.log("Solução atualizada:", data);
        
        toast({
          title: "Solução atualizada",
          description: "As alterações foram salvas com sucesso."
        });
      } else {
        // Criar nova solução
        const newSolution = {
          title: values.title,
          description: values.description,
          category: values.category,
          difficulty: values.difficulty,
          thumbnail_url: values.thumbnail_url,
          published: values.published,
          slug: values.slug || createUniqueSlug(values.title),
          author_id: user?.id
        };

        const { data, error } = await supabase
          .from("solutions")
          .insert(newSolution)
          .select()
          .single();

        if (error) throw error;

        setSolution(data as Solution);
        console.log("Nova solução criada:", data);
        
        toast({
          title: "Solução criada",
          description: "A solução foi criada com sucesso."
        });

        // Redirecionar para edição da nova solução
        navigate(`/admin/solutions/${data.id}`, { replace: true });
      }
    } catch (error: any) {
      console.error("Erro ao salvar solução:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a solução.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSaving(false);
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
    stepTitles
  };
};
