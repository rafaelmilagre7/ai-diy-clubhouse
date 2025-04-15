
import React from "react";
import { FileUpload } from "@/components/ui/file-upload";

interface MaterialUploadSectionProps {
  solutionId: string | null;
  onUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
}

const MaterialUploadSection: React.FC<MaterialUploadSectionProps> = ({ 
  solutionId, 
  onUploadComplete 
}) => {
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
          onUploadComplete={onUploadComplete}
          accept="*"
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
