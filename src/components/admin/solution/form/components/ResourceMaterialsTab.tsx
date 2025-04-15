import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle, Upload, Trash2 } from "lucide-react";
import ContentPreview from "../../ContentPreview";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues } from "../hooks/useResourcesFormData";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Resource, ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName, formatFileSize } from "../utils/resourceUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResourceMaterialsTabProps {
  form: UseFormReturn<ResourceFormValues>;
  solutionId: string | null;
}

const ResourceMaterialsTab: React.FC<ResourceMaterialsTabProps> = ({ form, solutionId }) => {
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
        // Process the materials data
        const processedMaterials = data.map(item => {
          try {
            let metadata: ResourceMetadata;
            
            if (typeof item.metadata === 'string') {
              metadata = JSON.parse(item.metadata);
            } else if (item.metadata) {
              metadata = item.metadata as ResourceMetadata;
            } else {
              // Create default metadata
              metadata = {
                title: item.name,
                description: `Arquivo ${item.format || getFileFormatName(item.name)}`,
                url: item.url,
                type: item.type as any,
                format: item.format,
                tags: [],
                size: item.size
              };
            }
            
            return {
              ...item,
              metadata
            } as Resource;
          } catch (e) {
            console.error("Error processing material:", e);
            
            // Return with minimal metadata
            return {
              ...item,
              metadata: {
                title: item.name,
                description: "Arquivo",
                url: item.url,
                type: item.type as any
              }
            } as Resource;
          }
        });

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
      
      const metadata: ResourceMetadata = {
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
        // Add the new resource to the state
        const newMaterials = [...materials, {
          ...data,
          metadata
        }];
        
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

  const getFileIcon = (type?: string) => {
    const iconProps = { className: "h-6 w-6" };
    
    switch(type) {
      case 'pdf': return <FileIcon.PDF {...iconProps} />;
      case 'spreadsheet': return <FileIcon.Spreadsheet {...iconProps} />;
      case 'presentation': return <FileIcon.Presentation {...iconProps} />;
      case 'image': return <FileIcon.Image {...iconProps} />;
      case 'video': return <FileIcon.Video {...iconProps} />;
      case 'document': return <FileIcon.Document {...iconProps} />;
      default: return <FileIcon.File {...iconProps} />;
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

// File icons components
const FileIcon = {
  File: (props: React.ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  PDF: (props: React.ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
      <path d="M9 9h1" />
    </svg>
  ),
  Spreadsheet: (props: React.ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h2" />
      <path d="M8 17h2" />
      <path d="M14 13h2" />
      <path d="M14 17h2" />
    </svg>
  ),
  Presentation: (props: React.ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <rect x="8" y="12" width="8" height="6" />
    </svg>
  ),
  Image: (props: React.ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Video: (props: React.ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  ),
  Document: (props: React.ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
};

export default ResourceMaterialsTab;
