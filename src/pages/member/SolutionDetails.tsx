
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlayCircle, Star, Download, CheckCircle } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import { SolutionContentSection } from "@/components/solution/SolutionContentSection";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [progress, setProgress] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
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
        uiToast({
          title: "Erro ao carregar solução",
          description: "Ocorreu um erro ao tentar carregar os detalhes da solução.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolution();
  }, [id, user, uiToast]);
  
  const startImplementation = async () => {
    if (!user || !solution) return;
    
    try {
      setInitializing(true);
      
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
      uiToast({
        title: "Erro ao iniciar implementação",
        description: "Ocorreu um erro ao tentar iniciar a implementação da solução.",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };
  
  const continueImplementation = () => {
    if (!solution || !progress) return;
    navigate(`/implement/${solution.id}/${progress.current_module}`);
  };
  
  const toggleFavorite = () => {
    toast.success("Solução adicionada aos favoritos!");
    // Implementação futura para favoritar soluções
  };
  
  const downloadMaterials = () => {
    toast.success("Baixando materiais de apoio...");
    // Implementação futura para download de materiais
  };
  
  if (loading) {
    return <LoadingScreen message="Carregando detalhes da solução..." />;
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-5 mb-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="tools">Ferramentas</TabsTrigger>
              <TabsTrigger value="materials">Materiais</TabsTrigger>
              <TabsTrigger value="videos">Vídeos</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <SolutionContentSection solution={solution} />
            </TabsContent>
            
            <TabsContent value="tools">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">Ferramentas Necessárias</h3>
                <p className="text-muted-foreground mb-6">
                  Estas são as ferramentas que você precisará para implementar esta solução:
                </p>
                <div className="space-y-4">
                  {solution.tools && Array.isArray(solution.tools) && solution.tools.length > 0 ? (
                    solution.tools.map((tool: any, index: number) => (
                      <div key={index} className="flex items-start p-3 border rounded-md">
                        <div className="bg-blue-100 p-2 rounded mr-3">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{tool.name}</h4>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                          {tool.url && (
                            <a 
                              href={tool.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                            >
                              Acessar ferramenta
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhuma ferramenta necessária para esta solução</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="materials">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">Materiais de Apoio</h3>
                <p className="text-muted-foreground mb-6">
                  Baixe os materiais necessários para implementar esta solução:
                </p>
                
                <div className="space-y-4">
                  {solution.materials && Array.isArray(solution.materials) && solution.materials.length > 0 ? (
                    solution.materials.map((material: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded mr-3">
                            <Download className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{material.name}</h4>
                            <p className="text-sm text-muted-foreground">{material.description || 'Material de apoio'}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(material.url, '_blank')}
                          disabled={!material.url}
                        >
                          Baixar
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum material disponível para esta solução</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="videos">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">Vídeos de Instrução</h3>
                <p className="text-muted-foreground mb-6">
                  Assista aos vídeos explicativos para facilitar sua implementação:
                </p>
                
                {solution.videos && Array.isArray(solution.videos) && solution.videos.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {solution.videos.map((video: any, index: number) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-100">
                          {video.youtube_id ? (
                            <iframe 
                              className="w-full h-full"
                              src={`https://www.youtube.com/embed/${video.youtube_id}`}
                              title={video.title || `Vídeo ${index + 1}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : video.url ? (
                            <iframe 
                              className="w-full h-full"
                              src={video.url}
                              title={video.title || `Vídeo ${index + 1}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <p className="text-muted-foreground">Vídeo não disponível</p>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium">{video.title || `Vídeo ${index + 1}`}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{video.description || 'Vídeo instrucional para implementação'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum vídeo disponível para esta solução</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="checklist">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">Checklist de Implementação</h3>
                <p className="text-muted-foreground mb-6">
                  Acompanhe seu progresso na implementação desta solução:
                </p>
                
                {solution.checklist && Array.isArray(solution.checklist) && solution.checklist.length > 0 ? (
                  <div className="space-y-4">
                    {solution.checklist.map((item: any, index: number) => (
                      <div key={index} className="flex items-start p-3 border rounded-md">
                        <input 
                          type="checkbox" 
                          id={`checklist-${index}`}
                          className="mt-1 mr-3 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                          <label htmlFor={`checklist-${index}`} className="font-medium cursor-pointer">
                            {item.title || `Passo ${index + 1}`}
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description || 'Descrição do passo de implementação'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum checklist disponível para esta solução</p>
                    <Button 
                      className="mt-4" 
                      onClick={startImplementation}
                    >
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Iniciar Implementação Guiada
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 sm:hidden">
            {progress?.is_completed ? (
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate(`/implement/${solution.id}/7`)}>
                Solução Implementada com Sucesso!
              </Button>
            ) : progress ? (
              <Button className="w-full" onClick={continueImplementation} disabled={initializing}>
                <PlayCircle className="mr-2 h-5 w-5" />
                Continuar Implementação ({Math.round((progress.current_module / 8) * 100)}%)
              </Button>
            ) : (
              <Button className="w-full" onClick={startImplementation} disabled={initializing}>
                <PlayCircle className="mr-2 h-5 w-5" />
                {initializing ? 'Preparando...' : 'Iniciar Implementação Guiada'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <SolutionSidebar 
            solution={solution}
            progress={progress}
            startImplementation={startImplementation}
            continueImplementation={continueImplementation}
            initializing={initializing}
          />
        </div>
      </div>
    </div>
  );
};

export default SolutionDetails;
