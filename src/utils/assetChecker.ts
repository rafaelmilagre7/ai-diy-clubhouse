/**
 * Utilidade para verificar se recursos existem antes de carregá-los
 */

export const checkAssetExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

export const safePreloadImage = async (src: string, priority: 'high' | 'low' = 'high') => {
  const exists = await checkAssetExists(src);
  
  if (!exists) {
    console.log(`[SafePreload] Asset não encontrado, pulando preload: ${src}`);
    return false;
  }

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.setAttribute('fetchpriority', priority);
  document.head.appendChild(link);
  
  return true;
};

// Lista de recursos críticos que devem ser verificados
export const CRITICAL_ASSETS = {
  AVATAR: '/lovable-uploads/6bdb44c0-b115-45bc-977d-4284836453c2.png',
  LOGO: '/lovable-uploads/d847c892-aafa-4cc1-92c6-110aff1d9755.png',
  CERTIFICATE_LOGO: '/lovable-uploads/a408c993-07fa-49f2-bee6-c66d0614298b.png'
} as const;

export const validateCriticalAssets = async () => {
  const results = await Promise.all(
    Object.entries(CRITICAL_ASSETS).map(async ([name, url]) => ({
      name,
      url,
      exists: await checkAssetExists(url)
    }))
  );
  
  const missing = results.filter(result => !result.exists);
  
  if (missing.length > 0) {
    console.warn('[AssetChecker] Assets críticos faltando:', missing);
  }
  
  return {
    all: results,
    missing,
    hasAllAssets: missing.length === 0
  };
};