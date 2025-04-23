
import React, { useState } from 'react';
import { Solution } from "@/types/supabaseTypes";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  AlertCircle, 
  CheckCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PublishSolutionFormProps {
  solution: Solution;
  onSave: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const PublishSolutionForm: React.FC<PublishSolutionFormProps> = ({ 
  solution, 
  onSave, 
  saving 
}) => {
  const [isPublished, setIsPublished] = useState(solution?.published || false);

  const handleTogglePublish = async () => {
    const newPublishState = !isPublished;
    setIsPublished(newPublishState);
    
    await onSave({
      ...solution,
      published: newPublishState
    } as SolutionFormValues);
  };
  
  // Verificar se a solução pode ser publicada (mínimo de dados necessários)
  const canPublish = solution?.title && solution?.description;
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Publicação</h3>
        <p className="text-muted-foreground mb-6">
          Revise sua solução antes de publicá-la para os membros.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <Label htmlFor="publish-switch">Status de publicação</Label>
            <p className="text-sm text-muted-foreground">
              {isPublished
                ? "A solução está visível para os membros"
                : "A solução está visível apenas para administradores"}
            </p>
          </div>
          <Switch
            id="publish-switch"
            checked={isPublished}
            onCheckedChange={handleTogglePublish}
            disabled={!canPublish || saving}
          />
        </div>
        
        {!canPublish && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Para publicar esta solução, preencha pelo menos o título e a descrição.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="pt-4 border-t mt-4">
          <h4 className="font-medium mb-2">Verificação de requisitos</h4>
          
          <div className="space-y-2">
            <div className="flex items-center">
              {solution?.title ? 
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> : 
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              }
              <span>Título</span>
            </div>
            
            <div className="flex items-center">
              {solution?.description ? 
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> : 
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              }
              <span>Descrição</span>
            </div>
            
            <div className="flex items-center">
              {solution?.thumbnail_url ? 
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> : 
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              }
              <span>Imagem de capa</span>
            </div>
          </div>
        </div>
        
        <Button 
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => window.open(`/solutions/${solution?.id}`, '_blank')}
        >
          <Eye className="mr-2 h-4 w-4" />
          Pré-visualizar solução
        </Button>
      </div>
    </div>
  );
};

export default PublishSolutionForm;
