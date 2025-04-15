
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  FileText, 
  File as FileIcon, 
  FileImage, 
  FileCode, 
  Save, 
  Loader2, 
  Trash2, 
  Download,
  Upload,
  Search,
  Plus,
  Tag,
  FileSpreadsheet,
  Presentation,
  FileVideo
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ResourceMetadata {
  title: string;
  description: string;
  url: string;
  type: "document" | "image" | "template" | "pdf" | "spreadsheet" | "presentation" | "video" | "other";
  format?: string;
  tags?: string[];
  order?: number;
  downloads?: number;
  size?: number;
  version?: string;
}

// Update the Resource interface to include the metadata field
interface Resource {
  id?: string;
  name: string;
  url: string;
  type: "document" | "image" | "template" | "pdf" | "spreadsheet" | "presentation" | "video" | "other";
  format?: string;
  solution_id: string;
  metadata?: ResourceMetadata;
  created_at?: string;
  updated_at?: string;
  module_id?: string;
  size?: number;
}

interface ResourcesUploadFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesUploadForm: React.FC<ResourcesUploadFormProps> = ({
  solutionId,
  onSave,
  saving
}) => {
  // State variables
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingResources, setSavingResources] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState<string>("all");
  const [showNewResourceDialog, setShowNewResourceDialog] = useState(false);
  const [newResource, setNewResource] = useState<ResourceMetadata>({
    title: "",
    description: "",
    url: "",
    type: "document",
    tags: [],
    order: 0,
    downloads: 0
  });
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (solutionId) {
      fetchResources();
    } else {
      setLoading(false);
    }
  }, [solutionId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("solution_resources")
        .select("*")
        .eq("solution_id", solutionId)
        .is("module_id", null); // apenas recursos da solução, não de módulos específicos
        
      if (error) throw error;
      
      if (data) {
        const typedResources = data.map(item => {
          // Extract or create metadata
          let metadata: ResourceMetadata | undefined;
          try {
            if (typeof item.metadata === 'string') {
              metadata = JSON.parse(item.metadata);
            } else if (item.metadata) {
              metadata = item.metadata as ResourceMetadata;
            } else {
              // Create default metadata if none exists
              metadata = {
                title: item.name,
                description: `Arquivo ${item.format || getFileFormatName(item.name)}`,
                url: item.url,
                type: item.type as any,
                format: item.format,
                tags: [],
                order: 0,
                downloads: 0,
                size: item.size,
                version: "1.0"
              };
            }
          } catch (e) {
            console.error("Error parsing metadata:", e);
            metadata = {
              title: item.name,
              description: `Arquivo`,
              url: item.url,
              type: item.type as any,
            };
          }
          
          // Determine resource type
          let validType: "document" | "image" | "template" | "pdf" | "spreadsheet" | "presentation" | "video" | "other" = "document";
          
          if (item.type === "image") {
            validType = "image";
          } else if (item.type === "template") {
            validType = "template";
          } else if (item.type === "pdf") {
            validType = "pdf";
          } else if (item.type === "spreadsheet") {
            validType = "spreadsheet";
          } else if (item.type === "presentation") {
            validType = "presentation";
          } else if (item.type === "video") {
            validType = "video";
          } else if (item.type === "other") {
            validType = "other";
          }
          
          return {
            id: item.id,
            name: item.name,
            url: item.url,
            type: validType,
            format: item.format,
            solution_id: item.solution_id,
            metadata: metadata,
            created_at: item.created_at,
            updated_at: item.updated_at,
            module_id: item.module_id,
            size: item.size
          } as Resource;
        });
        
        // Sort resources by order if available
        const sortedResources = typedResources.sort((a, b) => {
          const orderA = a.metadata?.order || 0;
          const orderB = b.metadata?.order || 0;
          return orderA - orderB;
        });
        
        setResources(sortedResources);
      }
    } catch (error) {
      console.error("Erro ao carregar recursos:", error);
      toast({
        title: "Erro ao carregar recursos",
        description: "Não foi possível carregar a lista de recursos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const detectFileType = (fileName: string): "document" | "image" | "template" | "pdf" | "spreadsheet" | "presentation" | "video" | "other" => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
      return 'document';
    } else if (['xls', 'xlsx', 'csv', 'ods'].includes(extension)) {
      return 'spreadsheet';
    } else if (['ppt', 'pptx', 'odp'].includes(extension)) {
      return 'presentation';
    } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
      return 'video';
    } else if (['json', 'html', 'js', 'css', 'xml'].includes(extension)) {
      return 'template';
    } else {
      return 'other';
    }
  };

  const getFileFormatName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (['pdf'].includes(extension)) return "PDF";
    if (['doc', 'docx'].includes(extension)) return "Word";
    if (['xls', 'xlsx'].includes(extension)) return "Excel";
    if (['ppt', 'pptx'].includes(extension)) return "PowerPoint";
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return "Imagem";
    if (['mp4', 'webm', 'mov'].includes(extension)) return "Vídeo";
    if (['html'].includes(extension)) return "HTML";
    if (['json'].includes(extension)) return "JSON";
    
    return extension.toUpperCase();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUploadComplete = async (url: string, fileName: string, fileSize: number) => {
    if (!solutionId) return;
    
    try {
      const fileType = detectFileType(fileName);
      const format = getFileFormatName(fileName);
      
      // Create resource metadata
      const metadata: ResourceMetadata = {
        title: fileName,
        description: `Arquivo ${format}`,
        url: url,
        type: fileType,
        format: format,
        tags: [],
        order: resources.length,
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
        const resource: Resource = {
          id: data.id,
          name: data.name,
          url: data.url,
          type: fileType,
          format: data.format,
          solution_id: data.solution_id,
          metadata: metadata,
          created_at: data.created_at,
          updated_at: data.updated_at,
          module_id: data.module_id,
          size: data.size
        };
        
        setResources(prev => [...prev, resource]);
      }
      
      toast({
        title: "Recurso adicionado",
        description: "O recurso foi adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao adicionar recurso:", error);
      toast({
        title: "Erro ao adicionar recurso",
        description: error.message || "Ocorreu um erro ao tentar adicionar o recurso.",
        variant: "destructive",
      });
    }
  };

  const handleCreateResource = async () => {
    if (!solutionId) return;
    
    try {
      // Validate required fields
      if (!newResource.title || !newResource.description || !newResource.url) {
        toast({
          title: "Campos obrigatórios",
          description: "Título, descrição e URL são campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }
      
      const resourceData = {
        solution_id: solutionId,
        name: newResource.title,
        url: newResource.url,
        type: newResource.type,
        format: newResource.format || getFileFormatName(newResource.url),
        metadata: newResource
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(resourceData)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const resource: Resource = {
          id: data.id,
          name: data.name,
          url: data.url,
          type: newResource.type,
          format: data.format,
          solution_id: data.solution_id,
          metadata: newResource,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setResources(prev => [...prev, resource]);
      }
      
      // Reset form and close dialog
      setNewResource({
        title: "",
        description: "",
        url: "",
        type: "document",
        tags: [],
        order: resources.length,
        downloads: 0
      });
      
      setShowNewResourceDialog(false);
      
      toast({
        title: "Recurso adicionado",
        description: "O recurso foi adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao adicionar recurso:", error);
      toast({
        title: "Erro ao adicionar recurso",
        description: error.message || "Ocorreu um erro ao tentar adicionar o recurso.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveResource = async (id?: string, url?: string) => {
    if (!id) return;
    
    try {
      if (url) {
        const filePath = url.split("/").pop();
        if (filePath) {
          // Try to delete from storage if it's a stored file
          try {
            await supabase.storage
              .from("solution_files")
              .remove([`documents/${filePath}`]);
          } catch (storageError) {
            console.error("Error removing file from storage (might be external URL):", storageError);
          }
        }
      }
      
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setResources(prev => prev.filter(resource => resource.id !== id));
      
      toast({
        title: "Recurso removido",
        description: "O recurso foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao remover recurso:", error);
      toast({
        title: "Erro ao remover recurso",
        description: error.message || "Ocorreu um erro ao tentar remover o recurso.",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (!newResource.tags) {
      setNewResource({...newResource, tags: [newTag.trim()]});
    } else {
      if (!newResource.tags.includes(newTag.trim())) {
        setNewResource({...newResource, tags: [...newResource.tags, newTag.trim()]});
      }
    }
    
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!newResource.tags) return;
    
    setNewResource({
      ...newResource, 
      tags: newResource.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const saveAndContinue = async () => {
    if (!solutionId) return;
    
    try {
      setSavingResources(true);
      
      onSave();
      
      toast({
        title: "Recursos salvos",
        description: "Os recursos foram salvos com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar recursos:", error);
      toast({
        title: "Erro ao salvar recursos",
        description: error.message || "Ocorreu um erro ao tentar salvar os recursos.",
        variant: "destructive",
      });
    } finally {
      setSavingResources(false);
    }
  };

  const getFileIcon = (type?: string, format?: string) => {
    const iconProps = { className: "h-6 w-6" };
    
    if (!type) return <FileIcon {...iconProps} />;
    
    switch(type) {
      case 'pdf':
        return <FileText {...iconProps} />;
      case 'document':
        return <FileText {...iconProps} />;
      case 'spreadsheet':
        return <FileSpreadsheet {...iconProps} />;
      case 'presentation':
        return <Presentation {...iconProps} />;
      case 'image':
        return <FileImage {...iconProps} />;
      case 'video':
        return <FileVideo {...iconProps} />;
      case 'template':
        return <FileCode {...iconProps} />;
      default:
        return <FileIcon {...iconProps} />;
    }
  };

  const filteredResources = resources.filter(resource => {
    // Filter by search query
    const searchMatch = 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by tab selection
    const tabMatch = 
      activeFilterTab === "all" || 
      resource.type === activeFilterTab;
    
    return searchMatch && tabMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Materiais de Apoio</h3>
        <p className="text-sm text-muted-foreground">
          Adicione documentos, templates e imagens que ajudarão o usuário a implementar a solução.
        </p>
      </div>
      
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar materiais..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog open={showNewResourceDialog} onOpenChange={setShowNewResourceDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Material</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                  placeholder="Digite um título para o material"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newResource.description}
                  onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                  placeholder="Descreva o conteúdo ou propósito deste material"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                  placeholder="https://exemplo.com/arquivo.pdf"
                />
                <p className="text-xs text-muted-foreground">
                  Insira um link para o arquivo ou use o botão de upload abaixo
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label>Tipo de Arquivo</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['document', 'spreadsheet', 'presentation', 'pdf', 'image', 'video', 'template', 'other'].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={newResource.type === type ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setNewResource({...newResource, type: type as any})}
                    >
                      {getFileIcon(type)}
                      <span className="ml-2 capitalize">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newResource.tags?.map((tag) => (
                    <Badge key={tag} className="gap-1">
                      {tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 rounded-full hover:bg-background/20 p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Adicionar tag"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button type="button" size="sm" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Upload de Arquivo</Label>
                <FileUpload
                  bucketName="solution_files"
                  folder="documents"
                  onUploadComplete={(url, fileName, fileSize) => {
                    setNewResource({
                      ...newResource,
                      title: fileName,
                      url: url,
                      type: detectFileType(fileName),
                      format: getFileFormatName(fileName),
                      size: fileSize
                    });
                  }}
                  accept="*"
                  maxSize={25} // 25MB
                  buttonText="Selecionar arquivo"
                  fieldLabel="Ou arraste e solte um arquivo aqui"
                />
                <p className="text-xs text-muted-foreground">
                  Tamanho máximo: 25MB. Formatos permitidos: PDFs, documentos, planilhas, imagens, vídeos, etc.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewResourceDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateResource}>
                Adicionar Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filter tabs */}
      <Tabs value={activeFilterTab} onValueChange={setActiveFilterTab} className="w-full">
        <TabsList className="flex w-full h-auto flex-wrap gap-2">
          <TabsTrigger value="all" className="flex gap-1 items-center">
            <FileIcon className="h-4 w-4" />
            <span>Todos</span>
          </TabsTrigger>
          <TabsTrigger value="document" className="flex gap-1 items-center">
            <FileText className="h-4 w-4" />
            <span>Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="spreadsheet" className="flex gap-1 items-center">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Planilhas</span>
          </TabsTrigger>
          <TabsTrigger value="presentation" className="flex gap-1 items-center">
            <FilePresentation className="h-4 w-4" />
            <span>Apresentações</span>
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex gap-1 items-center">
            <FileText className="h-4 w-4" />
            <span>PDFs</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="flex gap-1 items-center">
            <FileImage className="h-4 w-4" />
            <span>Imagens</span>
          </TabsTrigger>
          <TabsTrigger value="template" className="flex gap-1 items-center">
            <FileCode className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Quick upload cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Rápido</CardTitle>
            <CardDescription>
              Adicione PDFs, documentos, planilhas e outros materiais de apoio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              bucketName="solution_files"
              folder="documents"
              onUploadComplete={(url, fileName, fileSize) => handleUploadComplete(url, fileName, fileSize)}
              accept="*"
              maxSize={25} // 25MB
              buttonText="Upload de Material"
              fieldLabel="Selecione um arquivo (até 25MB)"
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Resources list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Materiais Adicionados</CardTitle>
          <CardDescription>
            {filteredResources.length} {filteredResources.length === 1 ? 'material encontrado' : 'materiais encontrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredResources.length > 0 ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredResources.map((resource) => (
                  <div 
                    key={resource.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md bg-gray-50 gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {getFileIcon(resource.type, resource.format)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{resource.metadata?.title || resource.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{resource.metadata?.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant={resource.type as any} className="capitalize">
                            {resource.type}
                          </Badge>
                          
                          {resource.metadata?.format && (
                            <Badge variant="outline">
                              {resource.metadata.format}
                            </Badge>
                          )}
                          
                          {resource.metadata?.size && (
                            <Badge variant="outline">
                              {formatFileSize(resource.metadata.size)}
                            </Badge>
                          )}
                          
                          {resource.metadata?.tags?.map(tag => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex gap-1"
                          >
                            <Download className="h-4 w-4 flex-shrink-0" />
                            <span className="sm:hidden md:inline">Download</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent width={300} align="end">
                          <div className="text-sm">
                            <p className="font-medium mb-2">Detalhes do arquivo:</p>
                            <div className="space-y-1">
                              <p><span className="text-muted-foreground">Nome:</span> {resource.name}</p>
                              {resource.metadata?.size && (
                                <p><span className="text-muted-foreground">Tamanho:</span> {formatFileSize(resource.metadata.size)}</p>
                              )}
                              {resource.metadata?.format && (
                                <p><span className="text-muted-foreground">Formato:</span> {resource.metadata.format}</p>
                              )}
                              {resource.metadata?.version && (
                                <p><span className="text-muted-foreground">Versão:</span> {resource.metadata.version}</p>
                              )}
                              <p><span className="text-muted-foreground">Downloads:</span> {resource.metadata?.downloads || 0}</p>
                            </div>
                            <div className="mt-4 flex justify-between">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(resource.url, "_blank")}
                                className="w-full"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveResource(resource.id, resource.url)}
                        className="flex gap-1"
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
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <p>Nenhum material encontrado para "{searchQuery}".</p>
              ) : (
                <p>Nenhum material foi adicionado ainda.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Button 
        onClick={saveAndContinue}
        disabled={savingResources || saving}
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
      >
        {savingResources ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar e Continuar
          </>
        )}
      </Button>
    </div>
  );
};

export default ResourcesUploadForm;
