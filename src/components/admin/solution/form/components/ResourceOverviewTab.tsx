
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ContentPreview from "../../ContentPreview";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues } from "../hooks/useResourcesFormData";

interface ResourceOverviewTabProps {
  form: UseFormReturn<ResourceFormValues>;
}

const ResourceOverviewTab: React.FC<ResourceOverviewTabProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Label htmlFor="overview">Resumo da Solução</Label>
        <Textarea
          id="overview"
          placeholder="Forneça uma visão geral completa desta solução..."
          rows={15}
          {...form.register('overview')}
        />
        <p className="text-sm text-muted-foreground">
          Este texto será exibido na página principal da solução, acima dos módulos de implementação.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Pré-visualização</Label>
        </div>
        <ContentPreview 
          content={form.watch('overview')} 
          isJson={false}
        />
      </div>
    </div>
  );
};

export default ResourceOverviewTab;
