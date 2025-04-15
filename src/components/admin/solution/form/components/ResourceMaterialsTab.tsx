import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues } from "../hooks/useResourcesFormData";
import { Resource } from "../types/ResourceTypes";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { detectFileType, getFileFormatName, formatFileSize } from "../utils/resourceUtils";
import { parseResourceMetadata } from "../utils/resourceMetadataUtils";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Upload, Trash2 } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { getFileIcon } from "../utils/iconUtils";

interface ResourceMaterialsTabProps {
  form: UseFormReturn<ResourceFormValues>;
  solutionId: string | null;
}

const ResourceMaterialsTab: React.FC<ResourceMaterialsTabProps> = ({ 
  form, 
  solutionId 
}) => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load materials from Supabase when component mounts
  useEffect(() => {
    if (solutionId) {
      fetchMaterials();
    } else {
      setLoading(false);
    }
  }, [solutionId]);

  const fetchMaterials = async () => {
    if (!solutionId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId);
        
      if (error) throw error;
      
      if (data) {
        // Process the materials data using the parseResourceMetadata utility
        const processedMaterials = data.map(item => parseResourceMetadata(item));
        
        // Update materials state and form value
        setMaterials(processedMaterials);
        
        // Update the form value with the JSON representation
        updateFormValue(processedMaterials);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast({
        title: "Erro ao carregar materiais",
        description: "Não foi possível carregar a lista de materiais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update the form value with the current materials
  const updateFormValue = (updatedMaterials: Resource[]) => {
    // Convert materials to the format needed for the form
    const materialsForJson = updatedMaterials.map(material => ({
      id: material.id,
      title: material.metadata.title || material.name,
      description: material.metadata.description || "",
      url: material.url,
      type: material.type,
      format: material.format || material.metadata.format,
      size: material.size || material.metadata.size
    }));
    
    form.setValue('materials', JSON.stringify(materialsForJson, null, 2));
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
      
      const metadata = {
        title: fileName,
        description: `Arquivo ${format}`,
        url: url,
        type: fileType,
        format: format,
        tags: [],
        order: materials.length,
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
        metadata: metadata,
        size: fileSize
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newResource)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Create a proper Resource object with the received data
        const newMaterial = parseResourceMetadata(data);
        
        // Add the new resource to the state
        const newMaterials = [...materials, newMaterial];
        
        setMaterials(newMaterials);
        updateFormValue(newMaterials);
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
      // Get the material to remove
      const materialToRemove = materials.find(m => m.id === id);
      
      if (materialToRemove && materialToRemove.url) {
        // If the file is stored in Supabase storage, try to remove it
        try {
          const fileName = materialToRemove.url.split('/').pop();
          if (fileName && fileName.includes('documents/')) {
            const filePath = fileName;
            await supabase.storage.from('solution_files').remove([filePath]);
          }
        } catch (storageError) {
          console.error("Error removing file from storage:", storageError);
          // Continue even if storage removal fails (might be an external URL)
        }
      }
      
      // Remove from Supabase
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Remove from state
      const updatedMaterials = materials.filter(material => material.id !== id);
      setMaterials(updatedMaterials);
      updateFormValue(updatedMaterials);
      
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
    <div className="space-y-6">
      <div className="bg-white border p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Upload de Material</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adicione materiais de suporte para esta solução (PDFs, planilhas, slides, etc).
        </p>
        
        {solutionId ? (
          <FileUpload
            bucketName="solution_files"
            folder="documents"
            onUploadComplete={handleUploadComplete}
            accept="*"
            maxSize={25} // 25MB
            buttonText="Upload de Material"
            fieldLabel="Selecione um arquivo (até 25MB)"
          />
        ) : (
          <div className="text-sm text-amber-600 p-3 bg-amber-50 rounded-md">
            Salve as informações básicas da solução antes de adicionar materiais.
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Materiais Adicionados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : materials.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {materials.map((material) => (
                  <div key={material.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md bg-gray-50 gap-3">
                    <div className="flex items-start gap-3">
                      {getFileIcon(material.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{material.metadata.title || material.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{material.metadata.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs capitalize">
                            {material.type}
                          </span>
                          
                          {(material.format || material.metadata.format) && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                              {material.format || material.metadata.format}
                            </span>
                          )}
                          
                          {(material.size || material.metadata.size) && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                              {formatFileSize(material.size || material.metadata.size || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(material.url, "_blank")}
                        className="flex gap-1"
                      >
                        <Upload className="h-4 w-4 flex-shrink-0" />
                        <span className="sm:hidden md:inline">Baixar</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveMaterial(material.id || '')}
                        className="flex gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 flex-shrink-0" />
                        <span className="sm:hidden md:inline">Remover</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>Nenhum material foi adicionado ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Hidden textarea to keep form working */}
      <input type="hidden" {...form.register('materials')} />
    </div>
  );
};

export default ResourceMaterialsTab;
