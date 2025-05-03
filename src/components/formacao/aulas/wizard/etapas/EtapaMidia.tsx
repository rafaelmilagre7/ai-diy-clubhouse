
import React, { useState } from "react";
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
import { ImageUpload } from "@/components/formacao/comum/ImageUpload";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { setupLearningStorageBuckets } from "@/lib/supabase/storage";

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
  const [bucketStatus, setBucketStatus] = useState<{ 
    checked: boolean;
    isReady: boolean;
    message?: string;
  }>({ checked: false, isReady: false });

  React.useEffect(() => {
    // Verificar o status dos buckets quando o componente é montado
    const checkBuckets = async () => {
      try {
        const result = await setupLearningStorageBuckets();
        console.log("Status dos buckets:", result);
        
        setBucketStatus({
          checked: true,
          isReady: result.success || result.partial,
          message: result.message
        });
      } catch (error) {
        console.error("Erro ao verificar buckets:", error);
        setBucketStatus({
          checked: true,
          isReady: false,
          message: "Falha ao verificar os buckets de armazenamento."
        });
      }
    };
    
    checkBuckets();
  }, []);

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
        {!bucketStatus.isReady && bucketStatus.checked && (
          <Alert variant="warning">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {bucketStatus.message || "Não foi possível verificar o status dos buckets de armazenamento. O upload de imagens pode falhar."}
            </AlertDescription>
          </Alert>
        )}
        
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
                    bucketName={STORAGE_BUCKETS.LEARNING_COVERS}
                    folderPath="covers"
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
        
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
            disabled={isSaving}
          >
            Voltar
          </Button>
          <Button 
            type="button" 
            onClick={handleContinue}
            disabled={isSaving}
          >
            Continuar
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default EtapaMidia;
