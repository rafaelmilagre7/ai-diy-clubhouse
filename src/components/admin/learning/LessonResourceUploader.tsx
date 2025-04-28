
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useLessonResources } from "@/hooks/learning/useLessonResources";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { LessonResource } from "@/types/learningTypes";
import { 
  FileIcon, 
  FileText, 
  Archive, 
  File as FileIcon2, 
  Image, 
  File,
  Loader2, 
  Plus, 
  Trash 
} from "lucide-react";

interface LessonResourceUploaderProps {
  lessonId: string;
}

export function LessonResourceUploader({ lessonId }: LessonResourceUploaderProps) {
  const [fileUrl, setFileUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  
  const { 
    resources, 
    isLoading, 
    addResource,
    removeResource,
    isUpdating
  } = useLessonResources(lessonId);
  
  const resetForm = () => {
    setFileUrl("");
    setName("");
    setDescription("");
    setFileType("");
    setFileSize(0);
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-6 w-6" />;
    
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6" />;
    if (fileType.includes('image')) return <Image className="h-6 w-6" />;
    if (fileType.includes('text') || fileType.includes('document')) return <FileText className="h-6 w-6" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return <Archive className="h-6 w-6" />;
    
    return <FileIcon className="h-6 w-6" />;
  };
  
  const handleAddResource = async () => {
    if (!name || !fileUrl) {
      toast.error("Nome e arquivo são obrigatórios");
      return;
    }
    
    try {
      setIsAdding(true);
      
      await addResource.mutateAsync({
        lesson_id: lessonId,
        name,
        description,
        file_url: fileUrl,
        file_type: fileType || null,
        file_size_bytes: fileSize || null,
        order_index: resources ? resources.length : 0,
      });
      
      resetForm();
      toast.success("Recurso adicionado com sucesso");
    } catch (error) {
      toast.error("Erro ao adicionar recurso");
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleRemoveResource = async (resourceId: string) => {
    try {
      await removeResource.mutateAsync(resourceId);
      toast.success("Recurso removido com sucesso");
    } catch (error) {
      toast.error("Erro ao remover recurso");
    }
  };
  
  const handleFileUploadComplete = (url: string, fileName?: string, fileSize?: number) => {
    setFileUrl(url);
    if (fileName && !name) {
      // Use o nome do arquivo como nome padrão se o usuário não tiver definido um
      setName(fileName.split('.')[0]);
    }
    if (fileSize) {
      setFileSize(fileSize);
    }
    // Tentar determinar o tipo de arquivo pela extensão
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (extension) {
      let type = '';
      switch (extension) {
        case 'pdf':
          type = 'application/pdf';
          break;
        case 'doc':
        case 'docx':
          type = 'application/msword';
          break;
        case 'xls':
        case 'xlsx':
          type = 'application/vnd.ms-excel';
          break;
        case 'ppt':
        case 'pptx':
          type = 'application/vnd.ms-powerpoint';
          break;
        case 'zip':
          type = 'application/zip';
          break;
        case 'png':
          type = 'image/png';
          break;
        case 'jpg':
        case 'jpeg':
          type = 'image/jpeg';
          break;
        default:
          type = 'application/octet-stream';
      }
      setFileType(type);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <h3 className="text-lg font-medium">Recursos da Aula</h3>
        
        {resources && resources.length > 0 ? (
          <div className="grid gap-4">
            {resources.map((resource: LessonResource) => (
              <Card key={resource.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 bg-muted rounded">
                        {getFileIcon(resource.file_type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{resource.name}</h4>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        <a 
                          href={resource.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRemoveResource(resource.id)}
                      disabled={isUpdating}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground mb-2">
              Esta aula ainda não tem recursos.
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-muted/30 p-4 rounded-md border">
        <h4 className="font-medium mb-4">Adicionar Novo Recurso</h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource-name">Nome do Recurso</Label>
            <Input
              id="resource-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do recurso"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resource-description">Descrição (opcional)</Label>
            <Textarea
              id="resource-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite uma descrição para o recurso"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Arquivo</Label>
            <FileUpload
              bucketName="learning_assets"
              folder={`lessons/${lessonId}/resources`}
              onUploadComplete={handleFileUploadComplete}
              accept="*"
              maxSize={20}
              buttonText="Fazer upload de arquivo"
              fieldLabel="Selecione um arquivo"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleAddResource} 
              disabled={!name || !fileUrl || isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Recurso
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
