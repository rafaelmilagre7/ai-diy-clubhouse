
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  ArrowRight,
  AlertCircle 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PublishTabProps {
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

const PublishTab: React.FC<PublishTabProps> = ({
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(solution?.published || false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar se todas as etapas estão preenchidas
  const toolsCount = solution?.tools_count || 0;
  const materialsCount = solution?.materials_count || 0;
  const videosCount = solution?.videos_count || 0;
  const checklistCount = solution?.checklist_count || 0;

  const hasBasicInfo = solution && solution.title && solution.description;
  const hasTools = toolsCount > 0;
  const hasMaterials = materialsCount > 0;
  const hasVideos = videosCount > 0;
  const hasChecklist = checklistCount > 0;
  
  // Calcular completude
  const completionStatus = {
    basicInfo: hasBasicInfo ? "complete" : "incomplete",
    tools: hasTools ? "complete" : "warning",
    materials: hasMaterials ? "complete" : "warning",
    videos: hasVideos ? "complete" : "warning",
    checklist: hasChecklist ? "complete" : "warning"
  };

  // Verificar se pode publicar
  const canPublish = hasBasicInfo;

  // Publicar ou despublicar solução
  const togglePublish = async () => {
    if (!solution?.id) return;

    try {
      setPublishing(true);
      const newPublishState = !isPublished;
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from("solutions")
        .update({ 
          published: newPublishState,
          updated_at: new Date().toISOString()
        })
        .eq("id", solution.id);
        
      if (error) throw error;
      
      setIsPublished(newPublishState);
      
      toast({
        title: newPublishState ? "Solução publicada" : "Solução despublicada",
        description: newPublishState 
          ? "A solução está agora disponível para os membros." 
          : "A solução não está mais visível para os membros."
      });
      
      // Chamar onSubmit para atualizar os valores
      await onSubmit({
        ...currentValues,
        published: newPublishState
      });
    } catch (error) {
      console.error("Erro ao alterar estado de publicação:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar alterar o estado de publicação.",
        variant: "destructive"
      });
    } finally {
      setPublishing(false);
    }
  };

  // Navegar para visualizar a solução
  const handleViewSolution = () => {
    if (solution?.id) {
      navigate(`/solutions/${solution.id}`);
    }
  };

  // Ícones baseados no status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "incomplete":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Status da solução
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            Revise sua solução antes de publicar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Etapas de criação</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    {getStatusIcon(completionStatus.basicInfo)}
                    <span className="ml-2">Informações Básicas</span>
                  </div>
                  {completionStatus.basicInfo === "incomplete" && (
                    <span className="text-xs text-red-500">Obrigatório</span>
                  )}
                  {completionStatus.basicInfo === "complete" && (
                    <span className="text-xs text-green-500">Completo</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    {getStatusIcon(completionStatus.tools)}
                    <span className="ml-2">Ferramentas</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {toolsCount} ferramenta(s)
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    {getStatusIcon(completionStatus.materials)}
                    <span className="ml-2">Materiais</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {materialsCount} material(is)
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    {getStatusIcon(completionStatus.videos)}
                    <span className="ml-2">Vídeos</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {videosCount} vídeo(s)
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    {getStatusIcon(completionStatus.checklist)}
                    <span className="ml-2">Checklist</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {checklistCount} item(ns)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label htmlFor="publish-switch">Status de publicação</Label>
                    <p className="text-sm text-muted-foreground">
                      {isPublished
                        ? "A solução está visível para os membros"
                        : "A solução está visível apenas para admins"}
                    </p>
                  </div>
                  <Switch
                    id="publish-switch"
                    checked={isPublished}
                    onCheckedChange={togglePublish}
                    disabled={!canPublish || publishing || saving || !solution?.id}
                  />
                </div>
                
                {!canPublish && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                      Para publicar esta solução, preencha pelo menos as informações básicas.
                    </AlertDescription>
                  </Alert>
                )}
                
                {solution?.id && (
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      onClick={handleViewSolution}
                      className="w-full"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar Solução
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishTab;
