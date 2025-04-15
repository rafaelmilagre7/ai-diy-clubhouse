
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ResourceUploadCardProps {
  handleUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
}

const ResourceUploadCard: React.FC<ResourceUploadCardProps> = ({ handleUploadComplete }) => {
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload Rápido</CardTitle>
        <CardDescription>
          Adicione PDFs, documentos, planilhas e outros materiais de apoio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploadError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        <FileUpload
          bucketName="solution_files"
          folder="documents"
          onUploadComplete={handleUpload}
          accept="*"
          maxSize={25} // 25MB
          buttonText="Upload de Material"
          fieldLabel="Selecione um arquivo (até 25MB)"
        />
        
        <p className="text-xs text-muted-foreground mt-2">
          Formatos suportados: PDF, Word, Excel, PowerPoint, imagens e outros arquivos.
        </p>
      </CardContent>
    </Card>
  );
};

export default ResourceUploadCard;
