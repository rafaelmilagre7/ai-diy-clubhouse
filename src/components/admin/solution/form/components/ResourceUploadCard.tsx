
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";

interface ResourceUploadCardProps {
  handleUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
}

const ResourceUploadCard: React.FC<ResourceUploadCardProps> = ({ handleUploadComplete }) => {
  return (
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
  );
};

export default ResourceUploadCard;
