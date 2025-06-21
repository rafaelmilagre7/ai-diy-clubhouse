
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

// URLs das logos - serão atualizadas após o upload
export const BRAND_LOGOS = {
  club: 'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/brand-logos/viver-de-ia-club-logo.png',
  formacao: 'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/brand-logos/formacao-viver-de-ia-logo.png',
  default: 'https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif' // fallback
};

// Cores por tipo de usuário
export const BRAND_COLORS = {
  club: {
    primary: '#0ea5e9', // azul viverblue
    text: 'text-viverblue',
    hover: 'hover:text-viverblue/80',
    bg: 'bg-viverblue',
    bgHover: 'hover:bg-viverblue/80'
  },
  formacao: {
    primary: '#06b6d4', // ciano/verde
    text: 'text-cyan-500',
    hover: 'hover:text-cyan-400',
    bg: 'bg-cyan-500',
    bgHover: 'hover:bg-cyan-400'
  }
};

export type UserType = 'club' | 'formacao';

/**
 * Detecta o tipo de usuário baseado no contexto
 */
export const detectUserType = (context?: {
  inviteRole?: string;
  urlParams?: URLSearchParams;
  defaultType?: UserType;
}): UserType => {
  // 1. Verificar role do convite
  if (context?.inviteRole) {
    if (context.inviteRole.toLowerCase().includes('formacao')) {
      return 'formacao';
    }
    if (context.inviteRole.toLowerCase().includes('club')) {
      return 'club';
    }
  }

  // 2. Verificar parâmetros da URL
  if (context?.urlParams) {
    const type = context.urlParams.get('type');
    if (type === 'formacao' || type === 'club') {
      return type as UserType;
    }
  }

  // 3. Fallback para tipo padrão ou club
  return context?.defaultType || 'club';
};

/**
 * Obtém a logo correta baseada no tipo de usuário
 */
export const getBrandLogo = (userType: UserType): string => {
  return BRAND_LOGOS[userType] || BRAND_LOGOS.default;
};

/**
 * Obtém as cores da marca baseada no tipo de usuário
 */
export const getBrandColors = (userType: UserType) => {
  return BRAND_COLORS[userType] || BRAND_COLORS.club;
};

/**
 * Faz upload da logo para o storage
 */
export const uploadBrandLogo = async (
  file: File, 
  logoType: UserType
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const fileName = `${logoType === 'club' ? 'viver-de-ia-club-logo' : 'formacao-viver-de-ia-logo'}.png`;
    
    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from('brand-logos')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });

    if (error) {
      logger.error(`Erro ao fazer upload da logo ${logoType}:`, error);
      return { success: false, error: error.message };
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('brand-logos')
      .getPublicUrl(fileName);

    logger.info(`Logo ${logoType} carregada com sucesso:`, publicUrl);
    
    return { success: true, url: publicUrl };
  } catch (error: any) {
    logger.error(`Erro no upload da logo ${logoType}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Inicializa as logos fazendo upload das imagens padrão
 */
export const initializeBrandLogos = async (): Promise<void> => {
  try {
    // Esta função pode ser chamada manualmente se necessário
    // para fazer upload das logos iniciais
    logger.info('Serviço de logos inicializado');
  } catch (error) {
    logger.error('Erro ao inicializar logos:', error);
  }
};
