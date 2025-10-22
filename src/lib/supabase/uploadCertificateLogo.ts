
import { supabase } from './client';

export const uploadCertificateLogo = async () => {
  try {
    // Fazer download da imagem local
    const response = await fetch('/images/viver-de-ia-logo.png');
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

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro no processo de upload:', error);
    return null;
  }
};

// URL da logo local para usar nos componentes e emails
export const CERTIFICATE_LOGO_URL = '/images/viver-de-ia-logo.png';

// URL pública da logo para emails (precisa ser acessível externamente)
export const EMAIL_LOGO_URL = 'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/certificates/logo/viver-de-ia-logo.png';
