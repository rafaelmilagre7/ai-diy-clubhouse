
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PublishToggleProps {
  isPublished: boolean;
  handlePublishToggle: (checked: boolean) => Promise<void>;
  saving: boolean;
}

/**
 * Componente de alternância para publicação de solução
 * Permite ao administrador ativar/desativar a visibilidade da solução para membros
 * Fornece feedback visual sobre o estado atual de publicação
 */
const PublishToggle: React.FC<PublishToggleProps> = ({ 
  isPublished, 
  handlePublishToggle, 
  saving 
}) => {
  return (
    <div className="pt-4 border-t">
      <div className="flex items-center justify-between">
        {/* Informações sobre a publicação */}
        <div>
          <Label htmlFor="publish-solution" className="text-base font-medium">
            Publicar Solução
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Quando publicada, a solução ficará disponível para todos os membros.
          </p>
        </div>
        
        {/* Switch para alternar estado de publicação */}
        <Switch
          id="publish-solution"
          checked={isPublished}
          onCheckedChange={handlePublishToggle}
          disabled={saving}
        />
      </div>
    </div>
  );
};

export default PublishToggle;
