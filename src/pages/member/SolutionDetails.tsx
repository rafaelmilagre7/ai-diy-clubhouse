
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlayCircle } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import { SolutionContentSection } from "@/components/solution/SolutionContentSection";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any | null>(null);
  
  useEffect(() => {
    const fetchSolution = async () => {
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
        
        // Fetch user progress for this solution
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("solution_id", id)
            .single();
          
          if (!progressError) {
            setProgress(progressData);
          }
        }
      } catch (error) {
        console.error("Error fetching solution:", error);
        toast({
          title: "Erro ao carregar solução",
          description: "Ocorreu um erro ao tentar carregar os detalhes da solução.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolution();
  }, [id, user, toast]);
  
  const startImplementation = async () => {
    if (!user || !solution) return;
    
    try {
      toast({
        title: "Iniciando implementação",
        description: "Preparando ambiente para implementação guiada...",
      });
      
      // If there's no progress record yet, create one
      if (!progress) {
        const { data, error } = await supabase
          .from("progress")
          .insert({
            user_id: user.id,
            solution_id: solution.id,
            current_module: 0,
            is_completed: false,
            last_activity: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        setProgress(data);
      }
      
      // Navigate to the implementation page, starting with module 0 (landing)
      navigate(`/implement/${solution.id}/0`);
    } catch (error) {
      console.error("Error starting implementation:", error);
      toast({
        title: "Erro ao iniciar implementação",
        description: "Ocorreu um erro ao tentar iniciar a implementação da solução.",
        variant: "destructive",
      });
    }
  };
  
  const continueImplementation = () => {
    if (!solution || !progress) return;
    
    toast({
      title: "Continuando implementação",
      description: "Carregando seu progresso anterior...",
    });
    
    navigate(`/implement/${solution.id}/${progress.current_module}`);
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!solution) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Solução não encontrada</h3>
        <p className="text-muted-foreground mt-1">
          A solução que você está procurando não existe ou foi removida.
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
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate("/dashboard")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para o Dashboard
      </Button>
      
      <SolutionHeaderSection solution={solution} />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <SolutionContentSection solution={solution} />
          
          <div className="mt-8 sm:hidden">
            {progress?.is_completed ? (
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate(`/implement/${solution.id}/7`)}>
                Solução Implementada com Sucesso!
              </Button>
            ) : progress ? (
              <Button className="w-full" onClick={continueImplementation}>
                <PlayCircle className="mr-2 h-5 w-5" />
                Continuar Implementação ({Math.round((progress.current_module / 8) * 100)}%)
              </Button>
            ) : (
              <Button className="w-full" onClick={startImplementation}>
                <PlayCircle className="mr-2 h-5 w-5" />
                Iniciar Implementação Guiada
              </Button>
            )}
          </div>
        </div>
        
        <SolutionSidebar 
          solution={solution}
          progress={progress}
          startImplementation={startImplementation}
          continueImplementation={continueImplementation}
        />
      </div>
    </div>
  );
};

export default SolutionDetails;
