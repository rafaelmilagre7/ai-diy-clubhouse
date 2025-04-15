
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import ContentPreview from "../../ContentPreview";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues, TEMPLATES } from "../hooks/useResourcesFormData";
import { addResourceSection } from "../utils/resourceSectionUtils";

interface ResourceLinksTabProps {
  form: UseFormReturn<ResourceFormValues>;
}

const ResourceLinksTab: React.FC<ResourceLinksTabProps> = ({ form }) => {
  const handleAddSection = () => {
    const currentValues = form.getValues().external_links || '';
    const newContent = addResourceSection('external_links', currentValues);
    if (newContent !== currentValues) {
      form.setValue('external_links', newContent);
    } else {
      // If parsing fails, reset to template
      form.setValue('external_links', TEMPLATES.external_links);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label htmlFor="external_links">Links Externos (JSON)</Label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAddSection}
            type="button"
            className="h-8 px-2 text-xs"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            Adicionar Link
          </Button>
        </div>
        <Textarea
          id="external_links"
          placeholder={TEMPLATES.external_links}
          rows={15}
          {...form.register('external_links')}
        />
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Adicione links para recursos externos úteis para esta solução.</p>
          <p>Campos necessários: <code>title</code>, <code>description</code>, <code>url</code>.</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Pré-visualização</Label>
        </div>
        <ContentPreview 
          content={form.watch('external_links')} 
          isJson={true}
        />
      </div>
    </div>
  );
};

export default ResourceLinksTab;
