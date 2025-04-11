
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud } from "lucide-react";

interface UploadButtonProps {
  onClick: () => void;
  disabled: boolean;
  uploading: boolean;
  uploadProgress: number;
  buttonText: string;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  onClick,
  disabled,
  uploading,
  uploadProgress,
  buttonText
}) => {
  return (
    <Button 
      type="button"
      onClick={onClick} 
      disabled={disabled}
      className="shrink-0"
    >
      {uploading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {uploadProgress}%
        </>
      ) : (
        <>
          <UploadCloud className="h-4 w-4 mr-2" />
          {buttonText}
        </>
      )}
    </Button>
  );
};
