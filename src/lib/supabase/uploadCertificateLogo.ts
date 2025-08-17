
import { supabase } from './client';

export const uploadCertificateLogo = async () => {
  try {
    // Fazer download da imagem do Lovable
    const response = await fetch('/lovable-uploads/eeab53e7-f5ba-412f-8e89-991fdf7b960f.png');
    const blob = await response.blob();
    
    // Converter para File
    const file = new File([blob], 'viver-de-ia-logo.png', { type: 'image/png' });
    
    // Fazer upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload('logo/viver-de-ia-logo.png', file, {
        upsert: true,
        contentType: 'image/png'
      });

    if (error) {
      console.error('Erro ao fazer upload da logo:', error);
      return null;
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('certificates')
      .getPublicUrl('logo/viver-de-ia-logo.png');

    console.log('Logo enviada com sucesso:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro no processo de upload:', error);
    return null;
  }
};

// URL da logo local para usar nos componentes - mudando para logo local
export const CERTIFICATE_LOGO_URL = '/lovable-uploads/eeab53e7-f5ba-412f-8e89-991fdf7b960f.png';
