
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues } from "../hooks/useResourcesFormData";
import { formatFileSize } from "../utils/resourceUtils";
import { useResourceMaterialsTab } from "../hooks/useResourceMaterialsTab";
import MaterialUploadSection from "./MaterialUploadSection";
import MaterialsList from "./MaterialsList";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ResourceMaterialsTabProps {
  form: UseFormReturn<ResourceFormValues>;
  solutionId: string | null;
}

const ResourceMaterialsTab: React.FC<ResourceMaterialsTabProps> = ({ 
  form, 
  solutionId 
}) => {
  const { toast } = useToast();
  const [bucketReady, setBucketReady] = useState(false);
  const [bucketError, setBucketError] = useState<string | null>(null);

  const {
    materials,
    loading,
    handleUploadComplete,
    handleRemoveResource
  } = useResourceMaterialsTab(form, solutionId);

  // Verificar se o bucket solution_files existe e criar se necessário
  useEffect(() => {
    const checkBucket = async () => {
      try {
        // Tentar criar o bucket via RPC function
        const { data, error } = await supabase.rpc('create_storage_public_policy', {
          bucket_name: 'solution_files'
        });
        
        if (error) {
          console.error('Erro ao verificar/criar bucket solution_files:', error);
          setBucketError(error.message || 'Erro desconhecido ao preparar o armazenamento');
          
          // Notificar o usuário sobre problemas com o armazenamento
          toast({
            title: "Atenção",
            description: "Houve um problema ao preparar o armazenamento. Uploads podem não funcionar corretamente.",
            variant: "destructive",
          });
        } else {
          console.log('Bucket solution_files verificado/criado com sucesso');
          setBucketReady(true);
        }
      } catch (err: any) {
        console.error('Exceção ao verificar bucket:', err);
        setBucketError(err.message);
        
        toast({
          title: "Erro de armazenamento",
          description: "Não foi possível inicializar o sistema de armazenamento. Por favor, tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    };
    
    checkBucket();
  }, [toast]);

  return (
    <div className="space-y-6">
      {bucketError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
          <strong>Erro de armazenamento:</strong> {bucketError}
          <p className="mt-1">O upload de arquivos pode não funcionar corretamente. Por favor, contate o suporte.</p>
        </div>
      )}
      
      <MaterialUploadSection 
        solutionId={solutionId} 
        onUploadComplete={handleUploadComplete}
        bucketReady={bucketReady}
      />

      <MaterialsList 
        materials={materials} 
        loading={loading} 
        onRemove={handleRemoveResource} 
      />
      
      {/* Hidden input to keep form working */}
      <input type="hidden" {...form.register('materials')} />
    </div>
  );
};

export default ResourceMaterialsTab;
