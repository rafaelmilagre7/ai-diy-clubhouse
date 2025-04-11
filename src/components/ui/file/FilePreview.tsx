
import React from "react";
import { CheckCircle } from "lucide-react";

interface FilePreviewProps {
  filePreview: string;
  uploadProgress: number;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ 
  filePreview, 
  uploadProgress 
}) => {
  return (
    <div className="mt-2 relative w-full max-w-xs">
      <img 
        src={filePreview} 
        alt="Preview" 
        className="rounded border max-h-40 object-contain" 
      />
      {uploadProgress === 100 && (
        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
          <CheckCircle className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};
