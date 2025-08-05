
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
import { AulaFormValues } from "../schemas/aulaFormSchema";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/formacao/comum/ImageUpload";

interface EtapaMidiaProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

const EtapaMidia: React.FC<EtapaMidiaProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving
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
                  <ImageUpload
                    value={field.value || ""}
                    onChange={field.onChange}
                    bucketName="learning_covers"
                    folderPath="aulas"
                    maxSizeMB={5}
                    disabled={isSaving}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="mt-6 text-sm text-muted-foreground">
            <h4 className="font-medium mb-1">Dicas para uma boa imagem de capa:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use imagens de alta qualidade e boa resolução</li>
              <li>Escolha imagens relacionadas ao tema da aula</li>
              <li>Evite imagens com muito texto</li>
              <li>Dimensões recomendadas: 1280x720 pixels (16:9)</li>
              <li>Tamanho máximo: 5MB</li>
            </ul>
          </div>
        </div>
        
      </div>
    </Form>
  );
};

export default EtapaMidia;
