
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  BarChart,
  Play,
  ChevronLeft,
  Award,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

// Helper function to format minutes to time
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
};

// Difficulty badge component
const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const getColor = () => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLabel = () => {
    switch (difficulty) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Médio";
      case "advanced":
        return "Avançado";
      default:
        return difficulty;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        getColor()
      )}
    >
      {getLabel()}
    </span>
  );
};

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
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
      navigate(`/implement/${solution.id}/${progress?.current_module || 0}`);
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
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate("/dashboard")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para o Dashboard
      </Button>
      
      <div className="relative rounded-xl overflow-hidden">
        <div 
          className="h-64 bg-cover bg-center"
          style={{ 
            backgroundImage: solution.thumbnail_url 
              ? `url(${solution.thumbnail_url})` 
              : `url('https://placehold.co/1200x400/0ABAB5/FFFFFF.png?text=VIVER+DE+IA+DIY&font=montserrat')` 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className={cn("bg-opacity-20 text-white border-white/30 backdrop-blur-sm badge-" + solution.category)}>
              {solution.category === "revenue" && "Aumento de Receita"}
              {solution.category === "operational" && "Otimização Operacional"}
              {solution.category === "strategy" && "Gestão Estratégica"}
            </Badge>
            <DifficultyBadge difficulty={solution.difficulty} />
          </div>
          <h1 className="text-3xl font-bold drop-shadow-sm">{solution.title}</h1>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Descrição</h2>
            <p className="mt-2 text-muted-foreground">{solution.description}</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold">O que você vai aprender</h2>
            <ul className="mt-2 space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Como configurar o ambiente para sua solução de IA</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Implementação passo a passo guiada e testada</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Otimização para máximo desempenho</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Métricas para acompanhamento de resultados</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold">Esta solução é ideal para você se...</h2>
            <ul className="mt-2 space-y-2">
              <li className="flex items-center">
                <ArrowRight className="h-5 w-5 text-viverblue mr-2" />
                <span>Você quer aumentar a produtividade da sua equipe</span>
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-5 w-5 text-viverblue mr-2" />
                <span>Você busca uma solução pronta para implementar hoje</span>
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-5 w-5 text-viverblue mr-2" />
                <span>Você quer resultados rápidos e mensuráveis</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Tempo estimado:</span>
                <span className="font-medium">{formatTime(solution.estimated_time)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Taxa de sucesso:</span>
                <span className="font-medium">{solution.success_rate}%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Badge ao concluir:</span>
                <span className="font-medium">Especialista em {solution.title}</span>
              </div>
              
              <div className="pt-2">
                {progress ? (
                  progress.is_completed ? (
                    <div className="space-y-3">
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate(`/implement/${solution.id}/7`)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Implementação Concluída
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => navigate(`/implement/${solution.id}/0`)}>
                        Iniciar Novamente
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={continueImplementation}>
                      <Play className="mr-2 h-4 w-4" />
                      Continuar Implementação
                    </Button>
                  )
                ) : (
                  <Button className="w-full" onClick={startImplementation}>
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Implementação
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Implementada por</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Mais de 125 membros já implementaram esta solução em suas empresas.
            </p>
            
            <div className="flex -space-x-2 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                  {i}
                </div>
              ))}
              <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">
                +120
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionDetails;
