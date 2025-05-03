
import React from "react";
import {
  Form,
  FormLabel,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AulaFormValues } from "../AulaStepWizard";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Plus, File, Link as LinkIcon, Trash } from "lucide-react";

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
  const handleContinue = async () => {
    onNext();
  };
  
  const resources = form.watch('resources') || [];
  
  const handleAddResource = (type: 'file' | 'link') => {
    form.setValue('resources', [...resources, { type, title: '', url: '' }]);
  };
  
  const handleRemoveResource = (index: number) => {
    const newResources = [...resources];
    newResources.splice(index, 1);
    form.setValue('resources', newResources);
  };
  
  const handleResourceChange = (index: number, field: string, value: any) => {
    const newResources = [...resources];
    newResources[index] = { ...newResources[index], [field]: value };
    form.setValue('resources', newResources);
  };
  
  return (
    <Form {...form}>
      <div className="space-y-6 py-4">
        <div>
          <FormLabel className="text-lg font-medium">Materiais de Apoio</FormLabel>
          <FormDescription className="mb-4">
            Adicione arquivos ou links que serão disponibilizados para os alunos
          </FormDescription>
          <FormMessage />
          
          <div className="space-y-4 mt-4">
            {resources.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">
                  Nenhum material adicionado. Use os botões abaixo para adicionar materiais.
                </p>
              </div>
            ) : (
              resources.map((resource, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      {resource.type === 'file' ? (
                        <File className="h-5 w-5 mr-2 text-blue-500" />
                      ) : (
                        <LinkIcon className="h-5 w-5 mr-2 text-green-500" />
                      )}
                      <h3 className="font-medium">
                        {resource.type === 'file' ? 'Arquivo' : 'Link'} {index + 1}
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveResource(index)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <FormLabel className="text-sm">Título do Material</FormLabel>
                      <Input
                        placeholder="Título do material"
                        value={resource.title || ''}
                        onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    {resource.type === 'file' ? (
                      <div>
                        <FormLabel className="text-sm">Upload do Arquivo</FormLabel>
                        <FileUpload
                          bucketName="learning_resources"
                          folder="materials"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt"
                          onUploadComplete={(url, fileName) => {
                            handleResourceChange(index, 'url', url);
                            handleResourceChange(index, 'fileName', fileName);
                          }}
                          buttonText="Escolher Arquivo"
                          fieldLabel={resource.fileName || "Selecione um arquivo"}
                          initialFileUrl={resource.url}
                        />
                      </div>
                    ) : (
                      <div>
                        <FormLabel className="text-sm">URL do Link</FormLabel>
                        <Input
                          placeholder="https://exemplo.com.br"
                          value={resource.url || ''}
                          onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleAddResource('file')}
            >
              <File className="mr-2 h-4 w-4" />
              Adicionar Arquivo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleAddResource('link')}
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Adicionar Link
            </Button>
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

export default EtapaMateriais;
