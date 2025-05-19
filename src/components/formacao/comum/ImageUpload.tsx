
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Trash, Upload } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

export interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  bucketName?: string;
  folderPath?: string;
  maxSizeMB?: number;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  bucketName = "public",
  folderPath = "learning_images",
  maxSizeMB = 5,
  label
}) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const {
    fileInputRef,
    triggerFileInput,
    handleFileChange,
    isUploading
  } = useImageUpload({
    bucketName,
    folderPath,
    onSuccess: onChange,
    maxSizeMB
  });

  const handleRemoveImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      {value ? (
        <div 
          className="relative border rounded-md overflow-hidden h-48"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <img 
            src={value} 
            alt="Imagem enviada" 
            className="w-full h-full object-cover"
          />
          {isHovering && !disabled && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={triggerFileInput}
                disabled={isUploading || disabled}
              >
                <Upload className="h-4 w-4 mr-2" />
                Trocar
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleRemoveImage}
                disabled={isUploading || disabled}
              >
                <Trash className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div 
          onClick={disabled ? undefined : triggerFileInput}
          className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center h-48 text-muted-foreground
            ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}`}
        >
          <Image className="h-10 w-10 mb-2" />
          {isUploading ? (
            <p>Enviando imagem...</p>
          ) : (
            <>
              <p className="mb-1">Arraste uma imagem ou clique para selecionar</p>
              <p className="text-xs">PNG, JPG ou GIF (máx. {maxSizeMB}MB)</p>
            </>
          )}
        </div>
      )}
      
      <Input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading || disabled}
      />
      
      {value && (
        <p className="text-xs text-muted-foreground truncate">
          URL: {value}
        </p>
      )}
    </div>
  );
};
