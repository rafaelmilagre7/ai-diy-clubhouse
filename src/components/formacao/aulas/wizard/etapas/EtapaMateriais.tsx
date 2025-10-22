
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
import { AulaFormValues } from "../schemas/aulaFormSchema";
import { FileUpload } from "@/components/formacao/comum/FileUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { File, Trash, Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface EtapaMateriaisProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
  aulaId?: string; // ID da aula sendo editada, se for uma edição
}

const EtapaMateriais: React.FC<EtapaMateriaisProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving,
  aulaId
}) => {
  const [savingMaterial, setSavingMaterial] = React.useState<number | null>(null);

  const handleContinue = async () => {
    const result = await form.trigger(['resources']);
    if (result) {
      onNext();
    } else {
      toast.error("Há problemas com os materiais. Verifique os campos obrigatórios.");
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

  // Função para salvar o material no banco de dados quando o upload for concluído
  const saveResourceToDatabase = async (index: number) => {
    try {
      setSavingMaterial(index);
      const resources = form.getValues().resources || [];
      const resource = resources[index];
      
      if (!resource?.url || !resource?.title) {
        toast.error("URL e título são obrigatórios para salvar o material.");
        return;
      }

      // Se estamos editando uma aula, salvar diretamente no banco
      if (aulaId) {
        const { data, error } = await supabase
          .from("learning_resources")
          .insert({
            lesson_id: aulaId,
            name: resource.title,
            description: resource.description || "",
            file_url: resource.url,
            file_type: resource.type,
            file_size_bytes: resource.fileSize,
            order_index: index
          })
          .select("*")
          .single();
          
        if (error) {
          console.error("Erro ao salvar material no banco:", error);
          throw error;
        }

        toast.success("Material adicionado com sucesso.");
      }
      
    } catch (error: any) {
      console.error("Erro ao salvar material:", error);
      toast.error(error.message || "Ocorreu um erro ao tentar salvar o material.");
    } finally {
      setSavingMaterial(null);
    }
  };

  const handleFileUpload = async (index: number, url: string, fileType: string | undefined, fileSize: number | undefined) => {
    handleMaterialChange(index, "url", url);
    handleMaterialChange(index, "type", fileType || "document");
    handleMaterialChange(index, "fileSize", fileSize);
    
    // Se temos um aulaId, salvar material diretamente no banco
    if (aulaId) {
      await saveResourceToDatabase(index);
    }
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
                        disabled={savingMaterial === index}
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
                        disabled={savingMaterial === index}
                      />
                      
                      <Textarea
                        placeholder="Descrição do material"
                        value={resource.description || ''}
                        onChange={(e) => handleMaterialChange(index, "description", e.target.value)}
                        className="resize-none h-20"
                        disabled={savingMaterial === index}
                      />
                      
                      <FileUpload
                        value={resource.url || ''}
                        onChange={(url, fileType, fileSize) => handleFileUpload(index, url, fileType, fileSize)}
                        bucketName="solution_files"
                        folderPath="learning_materials"
                        acceptedFileTypes="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/zip, image/jpeg, image/png"
                        disabled={savingMaterial === index}
                      />
                      
                      {savingMaterial === index && (
                        <div className="flex items-center justify-center p-2 bg-muted rounded">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span className="text-sm">Salvando material...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </Form>
  );
};

export default EtapaMateriais;
