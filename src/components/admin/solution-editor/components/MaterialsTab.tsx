
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileArchive, 
  Upload, 
  Loader2, 
  FilePlus,
  FileText,
  X,
  Link as LinkIcon,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResourceMetadata } from "@/components/admin/solution/form/types/ResourceTypes";
import { v4 as uuidv4 } from "uuid";
import { Badge } from "@/components/ui/badge";

interface MaterialsTabProps {
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

interface Material {
  id: string;
  name: string;
  url: string;
  type: string;
  format?: string;
  size?: number;
  metadata?: ResourceMetadata;
  created_at?: string;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [linkData, setLinkData] = useState({
    name: "",
    url: "",
    description: ""
  });
  const { toast } = useToast();

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Desconhecido";
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Carregar materiais da solução
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!solution?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("solution_resources")
          .select("*")
          .eq("solution_id", solution.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        setMaterials(data || []);
      } catch (error) {
        console.error("Erro ao carregar materiais:", error);
        toast({
          title: "Erro ao carregar materiais",
          description: "Não foi possível carregar os materiais desta solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [solution?.id, toast]);

  // Função para adicionar um link
  const handleAddLink = async () => {
    if (!solution?.id) {
      toast({
        title: "Erro",
        description: "É necessário salvar as informações básicas antes de adicionar materiais.",
        variant: "destructive"
      });
      return;
    }

    if (!linkData.name || !linkData.url) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e URL são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      const newMaterial = {
        solution_id: solution.id,
        name: linkData.name,
        type: "link",
        url: linkData.url,
        metadata: {
          title: linkData.name,
          description: linkData.description,
          url: linkData.url,
          type: "link",
        }
      };
      
      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newMaterial)
        .select();
        
      if (error) throw error;
      
      setMaterials(prev => [data[0], ...prev]);
      setAddLinkOpen(false);
      setLinkData({ name: "", url: "", description: "" });
      
      toast({
        title: "Link adicionado",
        description: "O link foi adicionado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar link:", error);
      toast({
        title: "Erro ao adicionar link",
        description: "Ocorreu um erro ao tentar adicionar o link.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Função para fazer upload de arquivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!solution?.id) {
      toast({
        title: "Erro",
        description: "É necessário salvar as informações básicas antes de adicionar materiais.",
        variant: "destructive"
      });
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `solution_resources/${solution.id}/${fileName}`;
        
        // Upload para o storage
        const { error: uploadError } = await supabase.storage
          .from("materials")
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // Obter a URL do arquivo
        const { data: urlData } = supabase.storage
          .from("materials")
          .getPublicUrl(filePath);
          
        if (!urlData) throw new Error("Não foi possível obter a URL do arquivo");
        
        // Determinar o tipo de arquivo
        const getFileType = (ext?: string) => {
          if (!ext) return "document";
          const imageExts = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
          const docExts = ["doc", "docx", "odt", "rtf", "txt", "md"];
          const spreadsheetExts = ["xls", "xlsx", "ods", "csv"];
          const presentationExts = ["ppt", "pptx", "odp"];
          const pdfExts = ["pdf"];
          
          if (imageExts.includes(ext.toLowerCase())) return "image";
          if (docExts.includes(ext.toLowerCase())) return "document";
          if (spreadsheetExts.includes(ext.toLowerCase())) return "spreadsheet";
          if (presentationExts.includes(ext.toLowerCase())) return "presentation";
          if (pdfExts.includes(ext.toLowerCase())) return "pdf";
          
          return "other";
        };
        
        const fileType = getFileType(fileExt);
        
        // Registrar no banco de dados
        const newMaterial = {
          solution_id: solution.id,
          name: file.name,
          type: fileType,
          url: urlData.publicUrl,
          format: fileExt,
          size: file.size,
          metadata: {
            title: file.name,
            description: `Arquivo ${fileType} para a solução`,
            url: urlData.publicUrl,
            type: fileType,
            format: fileExt,
            size: file.size
          }
        };
        
        const { data, error } = await supabase
          .from("solution_resources")
          .insert(newMaterial)
          .select();
          
        if (error) throw error;
        
        setMaterials(prev => [data[0], ...prev]);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      toast({
        title: "Upload concluído",
        description: `${files.length} arquivo(s) foram adicionados com sucesso.`
      });
      
      // Limpar input file após upload
      e.target.value = "";
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao tentar fazer o upload dos arquivos.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Função para remover material
  const handleRemove = async (id: string, url: string) => {
    try {
      // Remover do banco de dados
      const { error } = await supabase
        .from("solution_resources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Atualizar estado
      setMaterials(prev => prev.filter(m => m.id !== id));
      
      toast({
        title: "Material removido",
        description: "O material foi removido com sucesso."
      });
      
      // Tentativa de remover do storage se for um arquivo
      if (url.includes("materials")) {
        try {
          const filePath = url.split("/materials/")[1];
          if (filePath) {
            await supabase.storage
              .from("materials")
              .remove([filePath]);
          }
        } catch (storageError) {
          console.error("Erro ao remover arquivo do storage:", storageError);
          // Não mostrar erro ao usuário já que o registro foi removido do BD
        }
      }
    } catch (error) {
      console.error("Erro ao remover material:", error);
      toast({
        title: "Erro ao remover material",
        description: "Ocorreu um erro ao tentar remover o material.",
        variant: "destructive"
      });
    }
  };

  // Função para obter ícone baseado no tipo
  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return <img src="/icons/image.svg" alt="Imagem" className="w-6 h-6" />;
      case "pdf": return <img src="/icons/pdf.svg" alt="PDF" className="w-6 h-6" />;
      case "spreadsheet": return <img src="/icons/spreadsheet.svg" alt="Planilha" className="w-6 h-6" />;
      case "presentation": return <img src="/icons/presentation.svg" alt="Apresentação" className="w-6 h-6" />;
      case "document": return <FileText className="w-6 h-6 text-blue-500" />;
      case "link": return <LinkIcon className="w-6 h-6 text-purple-500" />;
      default: return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">
              Materiais da solução
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={addLinkOpen} onOpenChange={setAddLinkOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Adicionar Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar link</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="link-name">Nome</Label>
                      <Input
                        id="link-name"
                        placeholder="Nome do material"
                        value={linkData.name}
                        onChange={(e) => setLinkData({ ...linkData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link-url">URL</Label>
                      <Input
                        id="link-url"
                        placeholder="https://exemplo.com/material"
                        value={linkData.url}
                        onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link-description">Descrição (opcional)</Label>
                      <Textarea
                        id="link-description"
                        placeholder="Descrição do material"
                        value={linkData.description}
                        onChange={(e) => setLinkData({ ...linkData, description: e.target.value })}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleAddLink}
                      disabled={uploading || !linkData.name || !linkData.url}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adicionando...
                        </>
                      ) : (
                        "Adicionar Link"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <label htmlFor="file-upload" className="cursor-pointer">
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading || !solution?.id}
                />
                <Button size="sm" asChild>
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadProgress.toFixed(0)}%
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload de Arquivo
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!solution?.id && (
            <div className="flex items-center p-4 gap-2 bg-amber-50 border border-amber-200 rounded-md mb-4">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-amber-800">
                Salve as informações básicas antes de adicionar materiais.
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-md">
              <FileArchive className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Nenhum material ainda</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Faça upload de arquivos ou adicione links para a solução
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <label htmlFor="file-upload-empty" className="cursor-pointer">
                  <Input
                    id="file-upload-empty"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading || !solution?.id}
                  />
                  <Button size="sm" asChild disabled={!solution?.id}>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Fazer Upload
                    </span>
                  </Button>
                </label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAddLinkOpen(true)}
                  disabled={!solution?.id}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Adicionar Link
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <div 
                  key={material.id} 
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(material.type)}
                    </div>
                    <div>
                      <div className="font-medium">{material.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {material.type}
                        </Badge>
                        {material.size && (
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(material.size)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(material.url, "_blank")}
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(material.id, material.url)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remover</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialsTab;
