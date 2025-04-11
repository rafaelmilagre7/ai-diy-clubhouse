
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FilePlus, ExternalLink, FileText, Trash2, Clock, Upload, CheckCircle, XCircle, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface ResourcesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesForm = ({ solutionId, onSave, saving }: ResourcesFormProps) => {
  const [activeTab, setActiveTab] = useState("files");
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newResourceName, setNewResourceName] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [solution, setSolution] = useState<any>(null);
  const [moduleCompletionStats, setModuleCompletionStats] = useState<{total: number, completed: number}>({
    total: 8, // Total esperado de módulos
    completed: 0
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Buscar recursos da solução
  useEffect(() => {
    const fetchResources = async () => {
      if (!solutionId) return;
      
      setIsLoading(true);
      
      try {
        // Buscar os recursos
        const { data: resourcesData, error: resourcesError } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solutionId);
          
        if (resourcesError) throw resourcesError;
        
        setResources(resourcesData || []);
        
        // Buscar a solução
        const { data: solutionData, error: solutionError } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", solutionId)
          .single();
          
        if (solutionError) throw solutionError;
        
        setSolution(solutionData);
        
        // Buscar os módulos para estatísticas de conclusão
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("solution_id", solutionId);
          
        if (modulesError) throw modulesError;
        
        // Calcular quantos módulos têm conteúdo
        const completedModules = (modulesData || []).filter(module => 
          module.content && module.content.blocks && module.content.blocks.length > 0
        );
        
        setModuleCompletionStats({
          total: 8, // Esperamos 8 módulos no total
          completed: completedModules.length
        });
        
      } catch (error) {
        console.error("Error fetching resources:", error);
        toast({
          title: "Erro ao carregar recursos",
          description: "Não foi possível carregar os recursos desta solução.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, [solutionId, toast]);

  // Adicionar um novo link de recurso
  const handleAddExternalResource = async () => {
    if (!solutionId || !newResourceName || !newResourceUrl) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha o nome e a URL do recurso.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Validar URL
      try {
        new URL(newResourceUrl);
      } catch (e) {
        toast({
          title: "URL inválida",
          description: "A URL fornecida não é válida.",
          variant: "destructive",
        });
        return;
      }
      
      const newResource = {
        solution_id: solutionId,
        name: newResourceName,
        url: newResourceUrl,
        type: "link",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newResource)
        .select();
        
      if (error) throw error;
      
      setResources(prev => [...prev, ...(data || [])]);
      setNewResourceName("");
      setNewResourceUrl("");
      
      toast({
        title: "Recurso adicionado",
        description: "O link externo foi adicionado com sucesso.",
      });
      
    } catch (error) {
      console.error("Error adding resource:", error);
      toast({
        title: "Erro ao adicionar recurso",
        description: "Não foi possível adicionar o link externo.",
        variant: "destructive",
      });
    }
  };

  // Remover um recurso
  const handleRemoveResource = async (resourceId: string) => {
    if (!resourceId) return;
    
    try {
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", resourceId);
        
      if (error) throw error;
      
      setResources(prev => prev.filter(resource => resource.id !== resourceId));
      
      toast({
        title: "Recurso removido",
        description: "O recurso foi removido com sucesso.",
      });
      
    } catch (error) {
      console.error("Error removing resource:", error);
      toast({
        title: "Erro ao remover recurso",
        description: "Não foi possível remover o recurso.",
        variant: "destructive",
      });
    }
  };

  // Publicar a solução
  const handlePublishSolution = async () => {
    if (!solutionId) return;
    
    try {
      const { error } = await supabase
        .from("solutions")
        .update({ published: true, updated_at: new Date().toISOString() })
        .eq("id", solutionId);
        
      if (error) throw error;
      
      setSolution(prev => ({ ...prev, published: true }));
      
      toast({
        title: "Solução publicada",
        description: "A solução foi publicada com sucesso e agora está disponível para os membros.",
      });
      
    } catch (error) {
      console.error("Error publishing solution:", error);
      toast({
        title: "Erro ao publicar solução",
        description: "Não foi possível publicar a solução.",
        variant: "destructive",
      });
    }
  };

  // Despublicar a solução
  const handleUnpublishSolution = async () => {
    if (!solutionId) return;
    
    try {
      const { error } = await supabase
        .from("solutions")
        .update({ published: false, updated_at: new Date().toISOString() })
        .eq("id", solutionId);
        
      if (error) throw error;
      
      setSolution(prev => ({ ...prev, published: false }));
      
      toast({
        title: "Solução despublicada",
        description: "A solução foi despublicada e não está mais visível para os membros.",
      });
      
    } catch (error) {
      console.error("Error unpublishing solution:", error);
      toast({
        title: "Erro ao despublicar solução",
        description: "Não foi possível despublicar a solução.",
        variant: "destructive",
      });
    }
  };
  
  // Verificar se a solução está pronta para ser publicada
  const isReadyForPublishing = () => {
    // Verificar se todos os módulos estão completos
    return moduleCompletionStats.completed >= moduleCompletionStats.total;
  };
  
  // Função para visualizar a solução
  const handlePreviewSolution = () => {
    if (solutionId) {
      navigate(`/solution/${solutionId}`);
    }
  };

  return (
    <div className="space-y-6">
      {solutionId ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Recursos da Solução
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="files">Arquivos</TabsTrigger>
                      <TabsTrigger value="links">Links Externos</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="files">
                      <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-md p-6 text-center">
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Arraste arquivos aqui ou clique para fazer upload
                          </p>
                          <Input
                            type="file"
                            className="hidden"
                            id="file-upload"
                            onChange={() => {}}
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            Selecionar Arquivo
                          </Button>
                          
                          {isUploading && (
                            <div className="mt-4">
                              <Progress value={uploadProgress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                Fazendo upload... {uploadProgress}%
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {resources.filter(r => r.type === 'file').length > 0 ? (
                          <div className="space-y-2">
                            {resources
                              .filter(resource => resource.type === 'file')
                              .map(resource => (
                                <div 
                                  key={resource.id} 
                                  className="flex items-center justify-between p-3 border rounded-md"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <div>
                                      <p className="font-medium">{resource.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {resource.format || 'Desconhecido'} - {resource.size ? `${Math.round(resource.size/1024)} KB` : 'Tamanho desconhecido'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button size="icon" variant="ghost">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="text-red-500"
                                      onClick={() => handleRemoveResource(resource.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">
                            Nenhum arquivo adicionado
                          </p>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="links">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label htmlFor="resource-name">Nome do Recurso</Label>
                          <Input
                            id="resource-name"
                            placeholder="ex: Template de Relatório"
                            value={newResourceName}
                            onChange={(e) => setNewResourceName(e.target.value)}
                          />
                          
                          <Label htmlFor="resource-url">URL</Label>
                          <div className="flex gap-3">
                            <Input
                              id="resource-url"
                              placeholder="https://exemplo.com/recurso"
                              value={newResourceUrl}
                              onChange={(e) => setNewResourceUrl(e.target.value)}
                              className="flex-grow"
                            />
                            <Button 
                              onClick={handleAddExternalResource}
                              className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Adicionar Link
                            </Button>
                          </div>
                        </div>
                        
                        {resources.filter(r => r.type === 'link').length > 0 ? (
                          <div className="space-y-2 mt-6">
                            {resources
                              .filter(resource => resource.type === 'link')
                              .map(resource => (
                                <div 
                                  key={resource.id} 
                                  className="flex items-center justify-between p-3 border rounded-md"
                                >
                                  <div className="flex items-center gap-3">
                                    <ExternalLink className="h-5 w-5 text-blue-500" />
                                    <div>
                                      <p className="font-medium">{resource.name}</p>
                                      <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                                        {resource.url}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => window.open(resource.url, '_blank')}
                                    >
                                      <ExternalLink className="mr-1 h-4 w-4" />
                                      Visitar
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="text-red-500"
                                      onClick={() => handleRemoveResource(resource.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground text-sm py-4">
                            Nenhum link externo adicionado
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="mr-2 h-5 w-5" />
                    Status da Solução
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Status atual:</span>
                      <Badge variant={solution?.published ? "default" : "outline"} className={solution?.published ? "bg-green-500" : ""}>
                        {solution?.published ? "Publicada" : "Rascunho"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Módulos completos:</span>
                      <div className="flex items-center gap-2">
                        <span>{moduleCompletionStats.completed}/{moduleCompletionStats.total}</span>
                        {moduleCompletionStats.completed >= moduleCompletionStats.total ? (
                          <CheckCircle className="text-green-500 h-4 w-4" />
                        ) : (
                          <XCircle className="text-amber-500 h-4 w-4" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Tempo estimado:</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{solution?.estimated_time || 0} minutos</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Categoria:</span>
                      <Badge variant="outline">
                        {solution?.category === 'revenue' && 'Aumento de Receita'}
                        {solution?.category === 'operational' && 'Otimização Operacional'}
                        {solution?.category === 'strategy' && 'Gestão Estratégica'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Dificuldade:</span>
                      <Badge 
                        className={
                          solution?.difficulty === 'easy' ? 'bg-green-500' : 
                          solution?.difficulty === 'medium' ? 'bg-orange-500' : 
                          solution?.difficulty === 'advanced' ? 'bg-red-500' : ''
                        }
                      >
                        {solution?.difficulty === 'easy' && 'Fácil'}
                        {solution?.difficulty === 'medium' && 'Médio'}
                        {solution?.difficulty === 'advanced' && 'Avançado'}
                      </Badge>
                    </div>
                    
                    <div className="pt-4">
                      {!isReadyForPublishing() && (
                        <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200">
                          <AlertTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Solução incompleta
                          </AlertTitle>
                          <AlertDescription>
                            Complete todos os 8 módulos antes de publicar esta solução.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="space-y-2">
                        <Button 
                          className="w-full"
                          onClick={handlePreviewSolution}
                          variant="outline"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Pré-visualizar
                        </Button>
                        
                        {solution?.published ? (
                          <Button 
                            className="w-full bg-red-500 hover:bg-red-600"
                            onClick={handleUnpublishSolution}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Despublicar
                          </Button>
                        ) : (
                          <Button 
                            className="w-full bg-green-500 hover:bg-green-600"
                            onClick={handlePublishSolution}
                            disabled={!isReadyForPublishing()}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Publicar Solução
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <FilePlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold">Recursos da Solução</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Primeiro salve as informações básicas da solução antes de adicionar recursos.
          </p>
          <Button
            className="mt-4 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar Informações Básicas"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResourcesForm;
