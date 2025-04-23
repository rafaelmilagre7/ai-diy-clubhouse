
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link as LinkIcon, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MaterialsUploaderProps {
  solutionId: string | null;
  onUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
  onExternalLinkAdd?: (url: string, name: string) => Promise<void>;
}

const MaterialsUploader: React.FC<MaterialsUploaderProps> = ({ 
  solutionId,
  onUploadComplete,
  onExternalLinkAdd
}) => {
  const { toast } = useToast();
  const [externalUrl, setExternalUrl] = useState("");
  const [externalName, setExternalName] = useState("");

  const handleAddExternalLink = async () => {
    if (!solutionId) {
      toast({
        title: "Erro",
        description: "É necessário salvar a solução antes de adicionar links externos.",
        variant: "destructive",
      });
      return;
    }

    if (!externalUrl.trim()) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validar URL
      new URL(externalUrl);
      
      const linkName = externalName.trim() || externalUrl.split('/').pop() || "Link externo";
      
      if (onExternalLinkAdd) {
        await onExternalLinkAdd(externalUrl, linkName);
        
        // Limpar campos após sucesso
        setExternalUrl("");
        setExternalName("");
      }
    } catch (error) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida com protocolo (http:// ou https://).",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-base font-medium mb-2">Upload de arquivos</h3>
          <FileUpload
            bucketName="solution_files"
            folder="documents"
            onUploadComplete={onUploadComplete}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.json,.md,.txt,.zip,.rar,.png,.jpg,.jpeg,.gif"
            buttonText="Upload de arquivo"
            fieldLabel="Selecione um arquivo (tamanho máximo: 50MB)"
            maxSize={50} // 50MB
          />
        </div>
        
        {onExternalLinkAdd && (
          <div className="space-y-2">
            <h3 className="text-base font-medium">Adicionar link externo</h3>
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="external-url">URL</Label>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="external-url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://exemplo.com/documento.pdf"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="external-name">Nome do link (opcional)</Label>
                <Input
                  id="external-name"
                  value={externalName}
                  onChange={(e) => setExternalName(e.target.value)}
                  placeholder="Ex: Manual de instruções"
                />
              </div>
              
              <Button
                type="button"
                onClick={handleAddExternalLink}
                disabled={!externalUrl.trim()}
                className="w-full mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar link externo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialsUploader;
