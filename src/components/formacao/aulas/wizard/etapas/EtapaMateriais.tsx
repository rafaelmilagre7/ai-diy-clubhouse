
import React, { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { FileUpload } from "@/components/formacao/comum/FileUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { File, Trash, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { createStoragePublicPolicy } from "@/lib/supabase/storage";
import { useToast } from "@/hooks/use-toast";

interface EtapaMateriaisProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

const EtapaMateriais: React.FC<EtapaMateriaisProps> = ({
  form,
  onNext,
  onPrevious
}) => {
  const { toast } = useToast();

  // Inicializar o bucket learning_resources na montagem do componente
  useEffect(() => {
    const setupStorage = async () => {
      const bucketName = 'learning_resources';
      try {
        const result = await createStoragePublicPolicy(bucketName);
        if (!result.success) {
          console.error(`Não foi possível configurar o bucket ${bucketName}:`, result.error);
          toast({
            title: "Atenção",
            description: "Houve um problema ao preparar o armazenamento. Uploads podem não funcionar corretamente.",
            variant: "destructive",
          });
        } else {
          console.log(`Bucket ${bucketName} configurado com sucesso!`);
        }
      } catch (error) {
        console.error("Erro ao configurar bucket:", error);
      }
    };
    
    setupStorage();
  }, [toast]);

  const handleContinue = async () => {
    const result = await form.trigger(['resources']);
    if (result) {
      onNext();
    }
  };

  const handleAddMaterial = () => {
    const currentResources = form.getValues().resources || [];
    form.setValue("resources", [
      ...currentResources, 
      { title: "", description: "", url: "", type: "document" }
    ]);
  };

  const handleRemoveMaterial = (index: number) => {
    const resources = form.getValues().resources || [];
    const newResources = [...resources];
    newResources.splice(index, 1);
    form.setValue("resources", newResources);
  };

  const handleMaterialChange = (index: number, field: string, value: any) => {
    const newResources = [...form.getValues().resources];
    newResources[index] = { ...newResources[index], [field]: value };
    form.setValue("resources", newResources);
  };

  const resources = form.watch('resources') || [];

  return (
    <Form {...form}>
      <div className="space-y-6 py-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <FormLabel className="text-base">Materiais de Apoio</FormLabel>
            <Button
              type="button"
              size="sm"
              onClick={handleAddMaterial}
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar Material
            </Button>
          </div>
          
          <FormDescription className="mb-6">
            Adicione arquivos como PDFs, documentos ou planilhas que serão disponibilizados aos alunos.
          </FormDescription>
          
          {resources.length === 0 ? (
            <div className="p-8 border-2 border-dashed rounded-md text-center">
              <p className="text-muted-foreground">
                Nenhum material adicionado. Clique em "Adicionar Material" para começar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((resource, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <File className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-medium">Material {index + 1}</span>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMaterial(index)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <Input
                        placeholder="Título do material"
                        value={resource.title || ''}
                        onChange={(e) => handleMaterialChange(index, "title", e.target.value)}
                      />
                      
                      <Textarea
                        placeholder="Descrição do material"
                        value={resource.description || ''}
                        onChange={(e) => handleMaterialChange(index, "description", e.target.value)}
                        className="resize-none h-20"
                      />
                      
                      <FileUpload
                        value={resource.url || ''}
                        onChange={(url, fileType, fileSize) => {
                          handleMaterialChange(index, "url", url);
                          handleMaterialChange(index, "type", fileType || "document");
                          handleMaterialChange(index, "fileSize", fileSize);
                        }}
                        bucketName="learning_resources"
                        folderPath="materials"
                        acceptedFileTypes="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/zip, image/jpeg, image/png"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-between pt-4 border-t">
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

export default EtapaMateriais;
