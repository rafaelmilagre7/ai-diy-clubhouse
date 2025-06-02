
import { supabase } from '@/integrations/supabase/client';

export const uploadBrandAsset = async (file: File, fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('brand-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
};

export const getBrandAssetUrl = (fileName: string) => {
  return supabase.storage
    .from('brand-assets')
    .getPublicUrl(fileName).data.publicUrl;
};

// URLs das logos usando os uploads já feitos
export const BRAND_ASSETS = {
  horizontalLogo: '/lovable-uploads/4cca6f8d-6e56-44ee-acdb-5aefd772d2a1.png',
  squareIcon: '/lovable-uploads/d3463827-2645-4228-86f8-cee3dee9eb9a.png'
};
