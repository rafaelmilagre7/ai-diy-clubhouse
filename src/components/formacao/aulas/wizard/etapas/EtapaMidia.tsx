
import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/editor/Editor";

interface EtapaMidiaProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

const EtapaMidia: React.FC<EtapaMidiaProps> = ({
  form,
  onNext,
  onPrevious
}) => {
  const handleContinue = async () => {
    // Validar apenas os campos desta etapa
    const result = await form.trigger(['coverImageUrl']);
    if (result) {
      onNext();
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6 py-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="coverImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagem de Capa</FormLabel>
                <FormDescription className="mb-2">
                  Escolha uma imagem atrativa que represente o conteúdo da aula
                </FormDescription>
                <FormControl>
                  <Editor
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Visualização da imagem de capa */}
          {form.watch('coverImageUrl') && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Pré-visualização:</h3>
              <div className="border rounded-md p-2 bg-muted/20">
                <img 
                  src={form.watch('coverImageUrl')} 
                  alt="Imagem de capa" 
                  className="max-h-[200px] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x400?text=Imagem+Inválida";
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="mt-6 text-sm text-muted-foreground">
            <h4 className="font-medium mb-1">Dicas para uma boa imagem de capa:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use imagens de alta qualidade e boa resolução</li>
              <li>Escolha imagens relacionadas ao tema da aula</li>
              <li>Evite imagens com muito texto</li>
              <li>Dimensões recomendadas: 1280x720 pixels (16:9)</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
          >
            Voltar
          </Button>
          <Button 
            type="button" 
            onClick={handleContinue}
          >
            Continuar
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default EtapaMidia;
