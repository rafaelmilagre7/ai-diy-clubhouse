
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/auth";

interface UseImageUploadOptions {
  bucketName?: string;
  folderPath?: string;
  onSuccess?: (imageUrl: string) => void;
  maxSizeMB?: number;
}

export function useImageUpload({
  bucketName = 'public',
  folderPath = 'forum_images',
  onSuccess,
  maxSizeMB = 5
}: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) {
      toast.error("Você precisa estar logado para fazer upload de imagens");
      return;
    }

    // Check file size (max set by maxSizeMB)
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Imagem muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      return;
    }

    try {
      setIsUploading(true);
      
      // Generate a unique filename to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Get the image URL
      const imageUrl = data.publicUrl;
      
      if (onSuccess) {
        onSuccess(imageUrl);
      }

      return imageUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Erro ao fazer upload da imagem: ${error.message || 'Desconhecido'}`);
      return null;
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return {
    isUploading,
    fileInputRef,
    triggerFileInput,
    handleFileChange,
    handleImageUpload,
  };
}
