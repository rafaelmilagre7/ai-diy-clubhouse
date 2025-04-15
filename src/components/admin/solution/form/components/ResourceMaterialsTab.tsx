
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import ContentPreview from "../../ContentPreview";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues, TEMPLATES } from "../hooks/useResourcesFormData";
import { addResourceSection } from "../utils/resourceSectionUtils";

interface ResourceMaterialsTabProps {
  form: UseFormReturn<ResourceFormValues>;
}

const ResourceMaterialsTab: React.FC<ResourceMaterialsTabProps> = ({ form }) => {
  const handleAddSection = () => {
    const currentValues = form.getValues().materials || '';
    const newContent = addResourceSection('materials', currentValues);
    if (newContent !== currentValues) {
      form.setValue('materials', newContent);
    } else {
      // If parsing fails, reset to template
      form.setValue('materials', TEMPLATES.materials);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label htmlFor="materials">Materiais de Apoio (JSON)</Label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAddSection}
            type="button"
            className="h-8 px-2 text-xs"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            Adicionar Item
          </Button>
        </div>
        <Textarea
          id="materials"
          placeholder={TEMPLATES.materials}
          rows={15}
          {...form.register('materials')}
        />
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Adicione materiais de suporte para esta solução (PDFs, planilhas, slides, etc).</p>
          <p>Campos necessários: <code>title</code>, <code>description</code>, <code>url</code>, <code>type</code>.</p>
          <p>Tipos suportados: <code>pdf</code>, <code>spreadsheet</code>, <code>presentation</code>, <code>image</code>, <code>video</code>, <code>document</code>, <code>other</code>.</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Pré-visualização</Label>
        </div>
        <ContentPreview 
          content={form.watch('materials')} 
          isJson={true}
        />
      </div>
    </div>
  );
};

export default ResourceMaterialsTab;
