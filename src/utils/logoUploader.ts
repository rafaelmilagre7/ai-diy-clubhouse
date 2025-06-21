
import { supabase } from '@/integrations/supabase/client';

export const uploadEmailLogo = async () => {
  try {
    // Fazer download da imagem atual do Lovable
    const response = await fetch('/lovable-uploads/6bdb44c0-b115-45bc-977d-4284836453c2.png');
    const blob = await response.blob();
    
    // Converter para File
    const file = new File([blob], 'viver-de-ia-email-logo.png', { type: 'image/png' });
    
    // Fazer upload para o bucket "images" existente
    const { data, error } = await supabase.storage
      .from('images')
      .upload('email/viver-de-ia-logo.png', file, {
        upsert: true,
        contentType: 'image/png'
      });

    if (error) {
      console.error('Erro ao fazer upload da logo:', error);
      return null;
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl('email/viver-de-ia-logo.png');

    console.log('Logo enviada com sucesso para:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro no processo de upload:', error);
    return null;
  }
};

// URL da logo para usar nos emails - atualizada para bucket "images"
export const EMAIL_LOGO_URL = 'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/images/email/viver-de-ia-logo.png';
