
import React from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { detectFileType, getFileFormatName } from "../utils/resourceUtils";
import { ResourceMetadata } from "../types/ResourceTypes";

interface MaterialUploadSectionProps {
  solutionId: string | null;
  onUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
}

const MaterialUploadSection: React.FC<MaterialUploadSectionProps> = ({ 
  solutionId, 
  onUploadComplete 
}) => {
  const handleFileUploadComplete = async (url: string, fileName: string, fileSize: number) => {
    await onUploadComplete(url, fileName, fileSize);
  };
  
  return (
    <div className="bg-white border p-6 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Upload de Material</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Adicione materiais de suporte para esta solução (PDFs, planilhas, slides, etc).
      </p>
      
      {solutionId ? (
        <FileUpload
          bucketName="solution_files"
          folder="documents"
          onUploadComplete={handleFileUploadComplete}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt"
          maxSize={25} // 25MB
          buttonText="Upload de Material"
          fieldLabel="Selecione um arquivo (até 25MB)"
        />
      ) : (
        <div className="text-sm text-amber-600 p-3 bg-amber-50 rounded-md">
          Salve as informações básicas da solução antes de adicionar materiais.
        </div>
      )}
    </div>
  );
};

export default MaterialUploadSection;
