
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { ResourceMetadata } from "../types/ResourceTypes";
import { detectFileType, getFileFormatName } from "../utils/resourceUtils";

interface ResourceFormDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  newResource: ResourceMetadata;
  setNewResource: (resource: ResourceMetadata) => void;
  handleCreateResource: () => Promise<void>;
  getFileIcon: (type: string) => React.ReactNode;
}

const ResourceFormDialog: React.FC<ResourceFormDialogProps> = ({
  showDialog,
  setShowDialog,
  newResource,
  setNewResource,
  handleCreateResource,
  getFileIcon
}) => {
  const [newTag, setNewTag] = useState("");

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

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
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
              {(['document', 'spreadsheet', 'presentation', 'pdf', 'image', 'video', 'template', 'other'] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={newResource.type === type ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setNewResource({...newResource, type: type})}
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
                const fileType = detectFileType(fileName);
                setNewResource({
                  ...newResource,
                  title: fileName,
                  url: url,
                  type: fileType,
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
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateResource}>
            Adicionar Material
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceFormDialog;
