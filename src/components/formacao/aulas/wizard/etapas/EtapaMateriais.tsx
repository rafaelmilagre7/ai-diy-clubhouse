
import React, { useState, useEffect } from "react";
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
import { Plus, File, Link as LinkIcon, Trash, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ensureBucketExists } from "@/lib/supabase/storage";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";
import { toast } from "sonner";

interface EtapaMateriaisProps {
  form: UseFormReturn<AulaFormValues>;
  onNext: () => void;
  onPrevious: () => void;
  isSaving: boolean;
}

const EtapaMateriais: React.FC<EtapaMateriaisProps> = ({
  form,
  onNext,
  onPrevious,
  isSaving
}) => {
  const [bucketStatus, setBucketStatus] = useState<"checking" | "ready" | "error" | "partial">("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Verificar status do bucket quando o componente montar
  useEffect(() => {
    checkBucketStatus();
  }, []);

  const checkBucketStatus = async () => {
    try {
      setBucketStatus("checking");
      console.log("Verificando bucket de materiais de aprendizado...");
      
      // Tentar verificar e garantir que o bucket existe
      const bucketReady = await ensureBucketExists(STORAGE_BUCKETS.LEARNING_RESOURCES);
      
      if (bucketReady) {
        console.log("Bucket de materiais está pronto para uso");
        setBucketStatus("ready");
        setErrorMessage(null);
      } else {
        console.log("Bucket de materiais não está disponível, tentando fallback");
        
        // Tentar verificar o bucket de fallback
        const fallbackReady = await ensureBucketExists(STORAGE_BUCKETS.FALLBACK);
        
        if (fallbackReady) {
          console.log("Bucket fallback disponível");
          setBucketStatus("partial");
          setErrorMessage("Usando armazenamento alternativo para materiais.");
        } else {
          console.error("Nenhum bucket está disponível");
          setBucketStatus("error");
          setErrorMessage("Não foi possível configurar o armazenamento para materiais.");
        }
      }
    } catch (error) {
      console.error("Erro ao verificar bucket de materiais:", error);
      setBucketStatus("error");
      setErrorMessage(`Erro ao verificar armazenamento: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleRetryBucketSetup = async () => {
    setIsRetrying(true);
    toast.info("Verificando configuração de armazenamento...");
    await checkBucketStatus();
    
    if (bucketStatus === "ready") {
      toast.success("Armazenamento configurado com sucesso!");
    } else if (bucketStatus === "partial") {
      toast.success("Configuração parcial pronta. Usando armazenamento alternativo.");
    } else {
      toast.error("Não foi possível configurar o armazenamento. Serão usados buckets alternativos.");
    }
    setIsRetrying(false);
  };

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
          
          {/* Alertas de status do bucket */}
          {bucketStatus === "checking" && (
            <Alert className="mb-4">
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-r-transparent rounded-full"></div>
                <AlertDescription>Verificando configuração do armazenamento...</AlertDescription>
              </div>
            </Alert>
          )}
          
          {bucketStatus === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <div className="flex-1">
                <AlertDescription>{errorMessage || "Erro na configuração do armazenamento"}</AlertDescription>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryBucketSetup}
                    disabled={isRetrying}
                    className="flex items-center"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                        Tentando...
                      </>
                    ) : (
                      "Tentar novamente"
                    )}
                  </Button>
                </div>
              </div>
            </Alert>
          )}
          
          {bucketStatus === "partial" && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <div className="flex-1">
                <AlertDescription>
                  {errorMessage || "Configuração parcial do armazenamento. Usando bucket alternativo."}
                </AlertDescription>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryBucketSetup}
                    disabled={isRetrying}
                    className="flex items-center"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                        Tentando...
                      </>
                    ) : (
                      "Tentar reconfigurar"
                    )}
                  </Button>
                </div>
              </div>
            </Alert>
          )}
          
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
                          bucketName={bucketStatus === "ready" ? STORAGE_BUCKETS.LEARNING_RESOURCES : STORAGE_BUCKETS.FALLBACK}
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
                        {bucketStatus !== "ready" && (
                          <p className="text-amber-600 text-xs mt-1">
                            Usando bucket alternativo devido a problemas de configuração.
                          </p>
                        )}
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
            disabled={isSaving}
          >
            Continuar
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default EtapaMateriais;
