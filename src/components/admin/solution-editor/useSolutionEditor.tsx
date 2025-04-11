
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SolutionFormValues } from "@/components/admin/solution/BasicInfoForm";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  const defaultValues: SolutionFormValues = {
    title: "",
    description: "",
    category: "revenue" as const,
    difficulty: "medium" as const,
    estimated_time: 30,
    success_rate: 80,
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
      const slug = values.slug || values.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      // Garantir que todos os campos obrigatórios estejam presentes
      const solutionData = {
        title: values.title,
        description: values.description,
        category: values.category,
        difficulty: values.difficulty,
        estimated_time: values.estimated_time,
        success_rate: values.success_rate,
        slug: slug,
        thumbnail_url: values.thumbnail_url || null,
        published: values.published,
        updated_at: new Date().toISOString()
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
        estimated_time: solution.estimated_time,
        success_rate: solution.success_rate,
        thumbnail_url: solution.thumbnail_url || "",
        published: solution.published,
        slug: solution.slug,
      }
    : defaultValues;

  return {
    solution,
    loading,
    saving,
    activeTab,
    setActiveTab,
    onSubmit,
    currentValues
  };
};
