
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Upload, Trash2 } from "lucide-react";
import ContentPreview from "../../ContentPreview";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues, TEMPLATES } from "../hooks/useResourcesFormData";
import { addResourceSection } from "../utils/resourceSectionUtils";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Resource, ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName, formatFileSize } from "../utils/resourceUtils";

interface ResourceMaterialsTabProps {
  form: UseFormReturn<ResourceFormValues>;
  solutionId: string | null;
}

const ResourceMaterialsTab: React.FC<ResourceMaterialsTabProps> = ({ form, solutionId }) => {
  const { toast } = useToast();
  const [parsedMaterials, setParsedMaterials] = useState<Resource[]>([]);
  
  // Parse JSON when form value changes
  React.useEffect(() => {
    try {
      const materials = form.watch('materials');
      if (materials) {
        const parsed = JSON.parse(materials);
        if (Array.isArray(parsed)) {
          setParsedMaterials(parsed);
        }
      }
    } catch (e) {
      // Silently fail on parse error, user might be editing
    }
  }, [form.watch('materials')]);

  const handleAddSection = () => {
    const currentValues = form.getValues().materials || '';
    const newContent = addResourceSection('materials', currentValues);
    if (newContent !== currentValues) {
      form.setValue('materials', newContent);
    } else {
      // If parsing fails, reset to template
      form.setValue('materials', TEMPLATES.materials);
    }
  };

  const handleUploadComplete = async (url: string, fileName: string, fileSize: number) => {
    if (!solutionId) {
      toast({
        title: "Erro",
        description: "É necessário salvar a solução antes de adicionar materiais.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const fileType = detectFileType(fileName);
      const format = getFileFormatName(fileName);
      
      const metadata: ResourceMetadata = {
        title: fileName,
        description: `Arquivo ${format}`,
        url: url,
        type: fileType,
        format: format,
        tags: [],
        order: parsedMaterials.length,
        downloads: 0,
        size: fileSize,
        version: "1.0"
      };
      
      const newResource = {
        solution_id: solutionId,
        name: fileName,
        url: url,
        type: fileType,
        format: format,
        metadata: metadata
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newResource)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Adicionar o novo recurso ao JSON
        try {
          let currentMaterials = [];
          try {
            currentMaterials = JSON.parse(form.getValues().materials || '[]');
            if (!Array.isArray(currentMaterials)) {
              currentMaterials = [];
            }
          } catch (e) {
            currentMaterials = [];
          }
          
          // Adicionar o novo material
          currentMaterials.push({
            id: data.id,
            title: fileName,
            description: `Arquivo ${format}`,
            url: url,
            type: fileType,
            format: format,
            size: fileSize
          });
          
          // Atualizar o form
          form.setValue('materials', JSON.stringify(currentMaterials, null, 2));
          setParsedMaterials(currentMaterials);
        } catch (e) {
          console.error("Erro ao atualizar materiais:", e);
        }
      }
      
      toast({
        title: "Material adicionado",
        description: "O material foi adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao adicionar material:", error);
      toast({
        title: "Erro ao adicionar material",
        description: error.message || "Ocorreu um erro ao tentar adicionar o material.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMaterial = async (id: string) => {
    if (!id) return;
    
    try {
      // Remover do Supabase
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Remover do JSON
      try {
        let currentMaterials = [];
        try {
          currentMaterials = JSON.parse(form.getValues().materials || '[]');
          if (!Array.isArray(currentMaterials)) {
            currentMaterials = [];
          }
        } catch (e) {
          currentMaterials = [];
        }
        
        // Filtrar o material removido
        const updatedMaterials = currentMaterials.filter(
          (material: any) => material.id !== id
        );
        
        // Atualizar o form
        form.setValue('materials', JSON.stringify(updatedMaterials, null, 2));
        setParsedMaterials(updatedMaterials);
      } catch (e) {
        console.error("Erro ao atualizar materiais:", e);
      }
      
      toast({
        title: "Material removido",
        description: "O material foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao remover material:", error);
      toast({
        title: "Erro ao remover material",
        description: error.message || "Ocorreu um erro ao tentar remover o material.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label htmlFor="materials">Materiais de Apoio (JSON)</Label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAddSection}
            type="button"
            className="h-8 px-2 text-xs"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            Adicionar Item
          </Button>
        </div>
        <Textarea
          id="materials"
          placeholder={TEMPLATES.materials}
          rows={15}
          {...form.register('materials')}
        />
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Adicione materiais de suporte para esta solução (PDFs, planilhas, slides, etc).</p>
          <p>Campos necessários: <code>title</code>, <code>description</code>, <code>url</code>, <code>type</code>.</p>
          <p>Tipos suportados: <code>pdf</code>, <code>spreadsheet</code>, <code>presentation</code>, <code>image</code>, <code>video</code>, <code>document</code>, <code>other</code>.</p>
        </div>
        
        {solutionId && (
          <div className="mt-6 space-y-4">
            <Label>Upload de Material</Label>
            <FileUpload
              bucketName="solution_files"
              folder="documents"
              onUploadComplete={handleUploadComplete}
              accept="*"
              maxSize={25} // 25MB
              buttonText="Upload de Material"
              fieldLabel="Adicionar novo material via upload"
            />
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Pré-visualização</Label>
        </div>
        <ContentPreview 
          content={form.watch('materials')} 
          isJson={true}
        />
        
        {parsedMaterials.length > 0 && (
          <div className="mt-6 space-y-4">
            <Label>Materiais Adicionados</Label>
            <div className="border rounded-md p-4 space-y-3">
              {parsedMaterials.map((material: any, index) => (
                <div key={material.id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 truncate">
                      <p className="font-medium truncate">{material.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{material.description}</p>
                      {material.size && (
                        <p className="text-xs text-muted-foreground">{formatFileSize(material.size)}</p>
                      )}
                    </div>
                  </div>
                  {material.id && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveMaterial(material.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceMaterialsTab;
