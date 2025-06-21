
import { useState } from 'react';
import { uploadBrandLogo, UserType } from '@/services/brandLogoService';
import { toast } from 'sonner';

export const useLogoUploader = () => {
  const [uploading, setUploading] = useState(false);

  const uploadLogo = async (file: File, logoType: UserType) => {
    try {
      setUploading(true);
      
      const result = await uploadBrandLogo(file, logoType);
      
      if (result.success) {
        toast.success(`Logo ${logoType} carregada com sucesso!`);
        return result.url;
      } else {
        toast.error(`Erro ao carregar logo ${logoType}: ${result.error}`);
        return null;
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar logo: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadLogosFromUrls = async () => {
    try {
      setUploading(true);
      
      // URLs das imagens que você enviou (temporárias do Lovable)
      const clubLogoUrl = '/lovable-uploads/a408c993-07fa-49f2-bee6-c66d0614298b.png';
      const formacaoLogoUrl = '/lovable-uploads/d847c892-aafa-4cc1-92c6-110aff1d9755.png';
      
      // Converter URLs em Files e fazer upload
      const uploadPromises = [
        fetch(clubLogoUrl)
          .then(res => res.blob())
          .then(blob => new File([blob], 'club-logo.png', { type: 'image/png' }))
          .then(file => uploadBrandLogo(file, 'club')),
          
        fetch(formacaoLogoUrl)
          .then(res => res.blob())
          .then(blob => new File([blob], 'formacao-logo.png', { type: 'image/png' }))
          .then(file => uploadBrandLogo(file, 'formacao'))
      ];
      
      const results = await Promise.all(uploadPromises);
      
      const successCount = results.filter(r => r.success).length;
      
      if (successCount === 2) {
        toast.success('Todas as logos foram carregadas com sucesso!');
      } else {
        toast.warning(`${successCount} de 2 logos foram carregadas`);
      }
      
      return results;
    } catch (error: any) {
      toast.error(`Erro ao carregar logos: ${error.message}`);
      return [];
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadLogo,
    uploadLogosFromUrls
  };
};
