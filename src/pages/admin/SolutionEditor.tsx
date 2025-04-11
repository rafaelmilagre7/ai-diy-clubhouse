
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ChevronLeft, Save, Eye } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import BasicInfoForm, { SolutionFormValues } from "@/components/admin/solution/BasicInfoForm";
import ModulesForm from "@/components/admin/solution/ModulesForm";
import ResourcesForm from "@/components/admin/solution/ResourcesForm";

const SolutionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
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
  
  if (loading) {
    return <LoadingScreen />;
  }
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2"
            onClick={() => navigate("/admin/solutions")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para lista
          </Button>
          <h1 className="text-3xl font-bold">
            {id ? "Editar Solução" : "Nova Solução"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {id
              ? "Atualize os detalhes e conteúdo da solução"
              : "Crie uma nova solução para a plataforma DIY"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(id ? `/solution/${id}` : "/admin/solutions")}
          >
            <Eye className="mr-2 h-4 w-4" />
            {id ? "Visualizar" : "Cancelar"}
          </Button>
          <Button 
            type="submit"
            onClick={() => {
              if (activeTab === "basic") {
                const form = document.querySelector("form");
                if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
              } else {
                onSubmit(currentValues);
              }
            }}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-6">
          <BasicInfoForm 
            defaultValues={currentValues} 
            onSubmit={onSubmit} 
            saving={saving} 
          />
        </TabsContent>
        
        <TabsContent value="modules" className="space-y-6">
          <ModulesForm 
            solutionId={solution?.id || null} 
            onSave={() => onSubmit(currentValues)} 
            saving={saving} 
          />
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-6">
          <ResourcesForm 
            solutionId={solution?.id || null} 
            onSave={() => onSubmit(currentValues)} 
            saving={saving} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SolutionEditor;
