
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import ContentPreview from "../../ContentPreview";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues, TEMPLATES } from "../hooks/useResourcesFormData";
import { addResourceSection } from "../utils/resourceSectionUtils";

interface ResourceFaqTabProps {
  form: UseFormReturn<ResourceFormValues>;
}

const ResourceFaqTab: React.FC<ResourceFaqTabProps> = ({ form }) => {
  const handleAddSection = () => {
    const currentValues = form.getValues().faq || '';
    const newContent = addResourceSection('faq', currentValues);
    if (newContent !== currentValues) {
      form.setValue('faq', newContent);
    } else {
      // If parsing fails, reset to template
      form.setValue('faq', TEMPLATES.faq);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label htmlFor="faq">Perguntas Frequentes (JSON)</Label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAddSection}
            type="button"
            className="h-8 px-2 text-xs"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            Adicionar Pergunta
          </Button>
        </div>
        <Textarea
          id="faq"
          placeholder={TEMPLATES.faq}
          rows={15}
          {...form.register('faq')}
        />
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Adicione perguntas frequentes sobre esta solução.</p>
          <p>Campos necessários: <code>question</code>, <code>answer</code>.</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Pré-visualização</Label>
        </div>
        <ContentPreview 
          content={form.watch('faq')} 
          isJson={true}
        />
      </div>
    </div>
  );
};

export default ResourceFaqTab;
