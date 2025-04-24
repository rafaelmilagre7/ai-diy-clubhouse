
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Solution } from "@/types/supabaseTypes";

interface PublishTabProps {
  solution: Solution;
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
  const navigate = useNavigate();
  const isPublished = solution?.published || false;

  const handlePublishToggle = async () => {
    try {
      await onSubmit({
        ...currentValues,
        published: !isPublished
      });
    } catch (error) {
      console.error("Erro ao alterar estado de publicação:", error);
    }
  };

  // Verificar se pode publicar (mínimo de dados necessários)
  const canPublish = solution?.title && solution?.description;

  // Funções auxiliares para renderização
  const getStatusIcon = (status: 'complete' | 'warning' | 'incomplete') => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'incomplete':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Status de Publicação</h3>
              <p className="text-muted-foreground">
                {isPublished 
                  ? "A solução está visível para todos os membros."
                  : "A solução está visível apenas para administradores."}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="publish-switch">Publicar Solução</Label>
                <p className="text-sm text-muted-foreground">
                  {isPublished
                    ? "Desativar para tornar a solução privada"
                    : "Ativar para tornar a solução visível para membros"}
                </p>
              </div>
              <Switch
                id="publish-switch"
                checked={isPublished}
                onCheckedChange={handlePublishToggle}
                disabled={!canPublish || saving}
              />
            </div>

            {!canPublish && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Requisitos não atendidos</AlertTitle>
                <AlertDescription>
                  Para publicar esta solução, preencha pelo menos o título e a descrição.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h4 className="font-medium">Checklist de publicação</h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
                  {getStatusIcon(solution?.title ? 'complete' : 'incomplete')}
                  <span className="flex-1 mx-3">Título</span>
                  <span className="text-sm text-muted-foreground">
                    {solution?.title ? "Preenchido" : "Obrigatório"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
                  {getStatusIcon(solution?.description ? 'complete' : 'incomplete')}
                  <span className="flex-1 mx-3">Descrição</span>
                  <span className="text-sm text-muted-foreground">
                    {solution?.description ? "Preenchido" : "Obrigatório"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
                  {getStatusIcon(solution?.thumbnail_url ? 'complete' : 'warning')}
                  <span className="flex-1 mx-3">Imagem de capa</span>
                  <span className="text-sm text-muted-foreground">
                    {solution?.thumbnail_url ? "Adicionada" : "Recomendado"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/solutions/${solution?.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Visualizar Solução
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishTab;
