
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Solution, Module } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Download,
  Home
} from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

// Module title component
const ModuleTitle = ({ type }: { type: string }) => {
  switch (type) {
    case "landing":
      return "Início";
    case "overview":
      return "Visão Geral";
    case "preparation":
      return "Preparação";
    case "implementation":
      return "Implementação";
    case "verification":
      return "Verificação";
    case "results":
      return "Resultados";
    case "optimization":
      return "Otimização";
    case "celebration":
      return "Celebração";
    default:
      return type;
  }
};

// Mock function to render module content (would be replaced with actual content rendering)
const ModuleContent = ({ module, onComplete }: { module: any; onComplete: () => void }) => {
  if (!module) return null;
  
  const renderModuleType = () => {
    switch (module.type) {
      case "landing":
        return (
          <div className="max-w-3xl mx-auto text-center space-y-8 py-12">
            <h1 className="text-4xl font-bold">Bem-vindo à implementação</h1>
            <p className="text-xl text-muted-foreground">
              Vamos guiar você passo a passo na implementação desta solução de IA.
            </p>
            <div className="flex flex-col items-center space-y-2">
              <p className="text-muted-foreground">Esta implementação tem 8 módulos:</p>
              <ol className="space-y-2 text-left">
                <li className="flex items-center">
                  <span className="bg-viverblue text-white rounded-full h-6 w-6 flex items-center justify-center mr-2">1</span>
                  <span>Início - Onde você está agora</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">2</span>
                  <span>Visão Geral - Entenda o valor e contexto</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">3</span>
                  <span>Preparação - Configure seu ambiente</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">4</span>
                  <span>Implementação - Guia passo a passo</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">5</span>
                  <span>Verificação - Confirme que está funcionando</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">6</span>
                  <span>Resultados - Extraia valor imediato</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">7</span>
                  <span>Otimização - Melhore o desempenho</span>
                </li>
                <li className="flex items-center">
                  <span className="bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center mr-2">8</span>
                  <span>Celebração - Comemore seu sucesso</span>
                </li>
              </ol>
            </div>
            <div className="pt-6">
              <Button size="lg" onClick={onComplete}>
                <ChevronRight className="mr-2 h-5 w-5" />
                Começar Implementação
              </Button>
            </div>
          </div>
        );
      
      case "celebration":
        return (
          <div className="max-w-3xl mx-auto text-center space-y-8 py-12">
            <div className="animate-celebrate">
              <div className="h-32 w-32 mx-auto mb-6 rounded-full bg-viverblue flex items-center justify-center">
                <CheckCircle className="h-16 w-16 text-white" />
              </div>
              <h1 className="text-4xl font-bold">Parabéns!</h1>
              <p className="text-xl text-muted-foreground mt-4">
                Você implementou com sucesso a solução de IA.
              </p>
            </div>
            
            <div className="bg-card border rounded-xl p-8 mt-8">
              <h2 className="text-2xl font-semibold mb-4">Seu Certificado de Implementação</h2>
              <div className="border-4 border-viverblue/20 rounded-lg p-8 bg-white">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-viverblue">VIVER DE IA Club</h3>
                  <h4 className="text-3xl font-bold">Certificado de Implementação</h4>
                  <p className="text-lg">Concedido a</p>
                  <p className="text-2xl font-semibold">João Silva</p>
                  <p className="text-lg">por implementar com sucesso</p>
                  <p className="text-xl font-medium">Assistente de Vendas no Instagram</p>
                  <p className="text-sm text-muted-foreground">11 de Abril de 2025</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4">
                <Download className="mr-2 h-4 w-4" />
                Download do Certificado
              </Button>
            </div>
            
            <div className="flex flex-col items-center gap-4 pt-6">
              <Button size="lg" onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-5 w-5" />
                Implementação Concluída
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
                <Home className="mr-2 h-5 w-5" />
                Voltar para o Dashboard
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="max-w-3xl mx-auto space-y-8 py-12">
            <h2 className="text-2xl font-semibold">
              <ModuleTitle type={module.type} />
            </h2>
            <p className="text-muted-foreground">
              Conteúdo do módulo {module.type} - a ser implementado.
            </p>
            <div className="pt-6">
              <Button onClick={onComplete}>
                <CheckCircle className="mr-2 h-5 w-5" />
                Marcar como concluído e avançar
              </Button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-[60vh]">
      {renderModuleType()}
    </div>
  );
};

const SolutionImplementation = () => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const moduleIdx = parseInt(moduleIndex || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch solution and modules
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch solution details
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();
        
        if (solutionError) {
          throw solutionError;
        }
        
        setSolution(solutionData as Solution);
        
        // Fetch modules for this solution
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", id)
          .order("order", { ascending: true });
        
        if (modulesError) {
          throw modulesError;
        }
        
        // For now, we'll create temporary mock modules if none exist
        const actualModules = modulesData.length > 0 
          ? modulesData 
          : Array(8).fill(0).map((_, idx) => ({
              id: `mock-${idx}`,
              solution_id: id,
              title: `Module ${idx}`,
              content: {},
              type: ["landing", "overview", "preparation", "implementation", "verification", "results", "optimization", "celebration"][idx],
              order: idx,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
        
        setModules(actualModules as Module[]);
        setCurrentModule(actualModules[moduleIdx] as Module || null);
        
        // Fetch user progress
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", id)
            .single();
          
          if (!progressError && progressData) {
            setProgress(progressData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao tentar carregar os dados da implementação.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, moduleIdx, user, toast]);
  
  // Update progress when module changes
  useEffect(() => {
    const updateProgress = async () => {
      if (!user || !id || !progress) return;
      
      try {
        const { error } = await supabase
          .from("progress")
          .update({ 
            current_module: moduleIdx,
            last_activity: new Date().toISOString(),
            ...(moduleIdx === 7 ? { is_completed: true, completion_date: new Date().toISOString() } : {})
          })
          .eq("id", progress.id);
        
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    };
    
    updateProgress();
  }, [moduleIdx, user, id, progress]);
  
  const handleComplete = async () => {
    // If this is the last module, mark as complete and show celebration
    if (moduleIdx >= modules.length - 1) {
      if (user && progress) {
        try {
          const { error } = await supabase
            .from("progress")
            .update({ 
              is_completed: true,
              completion_date: new Date().toISOString(),
              last_activity: new Date().toISOString()
            })
            .eq("id", progress.id);
          
          if (error) {
            throw error;
          }
          
          // Navigate to the solution details page
          navigate(`/solution/${id}`);
          
          toast({
            title: "Implementação concluída!",
            description: "Parabéns! Você concluiu com sucesso a implementação desta solução.",
          });
        } catch (error) {
          console.error("Error completing implementation:", error);
        }
      }
    } else {
      // Navigate to the next module
      navigate(`/implement/${id}/${moduleIdx + 1}`);
    }
  };
  
  const handlePrevious = () => {
    if (moduleIdx > 0) {
      navigate(`/implement/${id}/${moduleIdx - 1}`);
    } else {
      navigate(`/solution/${id}`);
    }
  };
  
  const calculateProgress = () => {
    if (!modules.length) return 0;
    return Math.min(100, Math.round((moduleIdx / (modules.length - 1)) * 100));
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!solution || !currentModule) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Implementação não encontrada</h3>
        <p className="text-muted-foreground mt-1">
          A solução ou módulo que você está procurando não existe ou foi removido.
        </p>
        <Button 
          variant="link" 
          className="mt-4"
          onClick={() => navigate("/dashboard")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para o Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="pb-12">
      {/* Header section */}
      <div className="sticky top-16 z-10 bg-background pt-2 pb-4 border-b">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/solution/${id}`)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Voltar para detalhes
              </Button>
              <h1 className="text-2xl font-bold mt-1">{solution.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Clock className="h-4 w-4" />
                <span>Módulo {moduleIdx + 1} de {modules.length}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <HelpCircle className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Ajuda</span>
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Suporte</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={calculateProgress()} className="h-2" />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Início</span>
              <span>{calculateProgress()}% concluído</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Module content */}
      <div className="container mt-6">
        <ModuleContent 
          module={currentModule} 
          onComplete={handleComplete} 
        />
      </div>
      
      {/* Navigation footer */}
      <div className="sticky bottom-0 bg-background border-t py-4 mt-8">
        <div className="container flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            <ChevronLeft className="mr-2 h-5 w-5" />
            {moduleIdx > 0 ? 'Anterior' : 'Voltar para detalhes'}
          </Button>
          
          {moduleIdx < modules.length - 1 ? (
            <Button onClick={handleComplete}>
              Próximo
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-5 w-5" />
              Concluir Implementação
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionImplementation;
