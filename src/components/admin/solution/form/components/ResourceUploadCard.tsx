
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Upload, LinkIcon, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResourceUploadCardProps {
  handleUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
  handleYoutubeUrlSubmit?: (url: string) => Promise<void>;
  bucketReady?: boolean;
}

const ResourceUploadCard: React.FC<ResourceUploadCardProps> = ({
  handleUploadComplete,
  handleYoutubeUrlSubmit,
  bucketReady = true
}) => {
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [activeTab, setActiveTab] = useState("file");

  const handleUpload = async (url: string, fileName: string, fileSize: number) => {
    try {
      setUploadError(null);
      await handleUploadComplete(url, fileName, fileSize);
    } catch (error: any) {
      setUploadError(error.message || "Erro ao processar o arquivo após o upload");
    }
  };

  const submitYoutubeUrl = async () => {
    if (!youtubeUrl.trim() || !handleYoutubeUrlSubmit) return;
    try {
      setUploadError(null);
      await handleYoutubeUrlSubmit(youtubeUrl);
      setYoutubeUrl("");
    } catch (error: any) {
      setUploadError(error.message || "Erro ao processar o URL do YouTube");
    }
  };

  return (
    <Card className="border-2 border-dashed border-[#0ABAB5]/30 hover:border-[#0ABAB5]/50 transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#0ABAB5] flex items-center text-xl">
          <Upload className="h-5 w-5 mr-2" />
          Upload Rápido
        </CardTitle>
        <CardDescription className="text-base text-neutral-700 dark:text-neutral-300">
          Adicione PDFs, documentos, planilhas e outros materiais de apoio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        {!bucketReady && (
          <Alert variant="warning" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              O sistema de armazenamento pode não estar totalmente configurado. 
              O upload de arquivos pode não funcionar corretamente.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="file">Arquivo</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-6">
            <div className="p-6 rounded-md bg-gray-50 dark:bg-gray-800">
              <FileUpload 
                bucketName="solution_files" 
                folder="documents" 
                onUploadComplete={handleUpload} 
                accept="*" 
                maxSize={25} 
                buttonText="Upload de Material" 
                fieldLabel="Selecione um arquivo (até 25MB)" 
              />
            </div>
            
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Formatos suportados: PDF, Word, Excel, PowerPoint, imagens e outros arquivos.
            </p>
          </TabsContent>
          
          <TabsContent value="youtube" className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-md">
              <Label htmlFor="youtube-url" className="block mb-2 text-neutral-800 dark:text-white">URL do vídeo do YouTube</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <Input 
                    id="youtube-url" 
                    value={youtubeUrl} 
                    onChange={e => setYoutubeUrl(e.target.value)} 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    className="pl-10 text-neutral-800 dark:text-white" 
                  />
                </div>
                <Button onClick={submitYoutubeUrl} disabled={!youtubeUrl.trim()}>
                  Adicionar
                </Button>
              </div>
              <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                Cole o URL do vídeo do YouTube para adicionar automaticamente.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResourceUploadCard;
