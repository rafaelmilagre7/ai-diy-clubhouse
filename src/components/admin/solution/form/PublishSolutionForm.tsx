
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Check, 
  AlertTriangle, 
  CheckCircle2,
  FileText,
  Wrench,
  Video,
  ClipboardCheck,
  Globe,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Solution } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface PublishSolutionFormProps {
  solutionId: string | null;
  solution: Solution | null;
  onSave: (values: any) => Promise<void>;
  saving: boolean;
}

const PublishSolutionForm: React.FC<PublishSolutionFormProps> = ({
  solutionId,
  solution,
  onSave,
  saving
}) => {
  const [isPublished, setIsPublished] = useState(solution?.published || false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Função para formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handlePublishToggle = async (checked: boolean) => {
    setIsPublished(checked);
    
    try {
      await onSave({
        ...solution,
        published: checked
      });
      
      toast({
        title: checked ? "Solução publicada" : "Solução despublicada",
        description: checked 
          ? "A solução agora está visível para os membros." 
          : "A solução agora está oculta para os membros.",
        variant: checked ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar status de publicação:", error);
      
      // Reverter o estado em caso de erro
      setIsPublished(!checked);
      
      toast({
        title: "Erro ao atualizar publicação",
        description: error.message || "Ocorreu um erro ao tentar atualizar o status de publicação.",
        variant: "destructive",
      });
    }
  };

  const handleViewSolution = () => {
    if (solutionId) {
      navigate(`/solution/${solutionId}`);
    }
  };

  const handleTestImplementation = () => {
    if (solutionId) {
      navigate(`/implement/${solutionId}/0`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Revisão e Publicação</h3>
        <p className="text-sm text-muted-foreground">
          Revise todos os detalhes da solução antes de publicá-la para os membros.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resumo da Solução</CardTitle>
            <Badge variant={solution?.published ? "default" : "outline"}>
              {solution?.published ? "Publicada" : "Rascunho"}
            </Badge>
          </div>
          <CardDescription>
            Criada em {formatDate(solution?.created_at)}<br />
            Última atualização em {formatDate(solution?.updated_at)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Status de Implementação</h4>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 border-l-4 border-l-[#0ABAB5]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#0ABAB5]" />
                    <span className="font-medium">Informações Básicas</span>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-[#0ABAB5]" />
                </div>
              </Card>
              
              <StatusCard 
                icon={<Wrench className="h-5 w-5" />}
                title="Ferramentas"
                status="check"
              />
              
              <StatusCard 
                icon={<FileText className="h-5 w-5" />}
                title="Materiais de Apoio"
                status="check"
              />
              
              <StatusCard 
                icon={<Video className="h-5 w-5" />}
                title="Vídeo-aulas"
                status="check"
              />
              
              <StatusCard 
                icon={<ClipboardCheck className="h-5 w-5" />}
                title="Checklist de Implementação"
                status="check"
              />
              
              <StatusCard 
                icon={<Globe className="h-5 w-5" />}
                title="Publicação"
                status={isPublished ? "check" : "pending"}
              />
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="publish-solution" className="text-base font-medium">
                  Publicar Solução
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Quando publicada, a solução ficará disponível para todos os membros.
                </p>
              </div>
              <Switch
                id="publish-solution"
                checked={isPublished}
                onCheckedChange={handlePublishToggle}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-3 border-t pt-6">
          <Button 
            variant="outline"
            onClick={handleViewSolution}
            disabled={!solutionId}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar Solução
          </Button>
          
          <Button 
            onClick={handleTestImplementation}
            disabled={!solutionId}
            className="flex-1 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            <Play className="h-4 w-4 mr-2" />
            Testar Implementação
          </Button>
        </CardFooter>
      </Card>
      
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/solutions")}
          disabled={saving}
        >
          Voltar para Lista de Soluções
        </Button>
      </div>
    </div>
  );
};

// Componente para status de cada etapa
interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  status: "check" | "warning" | "pending";
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, title, status }) => {
  let statusIcon;
  let statusColor;
  
  switch (status) {
    case "check":
      statusIcon = <CheckCircle2 className="h-5 w-5 text-green-600" />;
      statusColor = "border-l-green-600";
      break;
    case "warning":
      statusIcon = <AlertTriangle className="h-5 w-5 text-amber-600" />;
      statusColor = "border-l-amber-600";
      break;
    case "pending":
      statusIcon = <AlertCircle className="h-5 w-5 text-slate-400" />;
      statusColor = "border-l-slate-400";
      break;
  }
  
  return (
    <Card className={`p-4 border-l-4 ${statusColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {React.cloneElement(icon as React.ReactElement, { 
            className: `h-5 w-5 ${status === "check" ? "text-green-600" : status === "warning" ? "text-amber-600" : "text-slate-400"}` 
          })}
          <span className="font-medium">{title}</span>
        </div>
        {statusIcon}
      </div>
    </Card>
  );
};

// Adicionar ícones que não foram importados
import { AlertCircle, Eye, Play } from "lucide-react";

export default PublishSolutionForm;
