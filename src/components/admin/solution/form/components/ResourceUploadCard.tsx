
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Upload } from "lucide-react";

interface ResourceUploadCardProps {
  handleUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
}

const ResourceUploadCard: React.FC<ResourceUploadCardProps> = ({ 
  handleUploadComplete
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
          Upload de Materiais
        </CardTitle>
        <CardDescription className="text-base">
          Adicione PDFs, documentos, planilhas e outros materiais de apoio para download.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        <div className="bg-gray-50 p-6 rounded-md">
          <FileUpload
            bucketName="solution_files"
            folder="documents"
            onUploadComplete={handleUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.json,.md,.txt,.zip,.rar"
            maxSize={25} // 25MB
            buttonText="Upload de Material"
            fieldLabel="Selecione um arquivo (até 25MB)"
          />
        </div>
        
        <p className="text-sm text-muted-foreground">
          Formatos suportados: PDF, Word, Excel, PowerPoint, arquivos de texto e outros documentos.
        </p>
      </CardContent>
    </Card>
  );
};

export default ResourceUploadCard;
