
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Upload, Info } from "lucide-react";

interface ResourceUploadCardProps {
  handleUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
  bucketReady?: boolean;
}

const ResourceUploadCard: React.FC<ResourceUploadCardProps> = ({
  handleUploadComplete,
  bucketReady = true
}) => {
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const handleUpload = async (url: string, fileName: string, fileSize: number) => {
    try {
      setUploadError(null);
      await handleUploadComplete(url, fileName, fileSize);
    } catch (error: any) {
      setUploadError(error.message || "Erro ao processar o arquivo após o upload");
    }
  };

  return (
    <Card className="border-2 border-dashed border-[#0ABAB5]/30 hover:border-[#0ABAB5]/50 transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#0ABAB5] flex items-center text-xl">
          <Upload className="h-5 w-5 mr-2" />
          Upload de Material
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
      </CardContent>
    </Card>
  );
};

export default ResourceUploadCard;
