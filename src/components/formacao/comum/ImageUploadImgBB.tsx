
import React from "react";
import { ImageUpload } from "@/components/common/ImageUpload";

interface ImageUploadImgBBProps {
  value: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

/**
 * @deprecated Este componente está sendo substituído pelo ImageUpload que usa Supabase Storage.
 * Use ImageUpload do @/components/common/ImageUpload em vez deste componente.
 * 
 * Este componente é mantido apenas para compatibilidade com código existente
 * e será removido em uma versão futura.
 */
export const ImageUploadImgBB: React.FC<ImageUploadImgBBProps> = ({
  value,
  onChange,
  maxSizeMB = 5,
  disabled = false
}) => {
  console.warn(
    'ImageUploadImgBB está depreciado. Use ImageUpload do @/components/common/ImageUpload'
  );

  return (
    <ImageUpload
      value={value}
      onChange={onChange}
      bucketName="lesson_images"
      folderPath="deprecated"
      maxSizeMB={maxSizeMB}
      enableOptimization={true}
    />
  );
};
