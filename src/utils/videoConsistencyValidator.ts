/**
 * Utilitário para validar consistência de dados de vídeo
 * Detecta problemas comuns como referências a video_url vs url
 */

import { devLog, devWarn } from '@/hooks/useOptimizedLogging';

export interface VideoDataValidation {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Valida um objeto de dados de vídeo
 */
export function validateVideoData(data: any, context: string = 'unknown'): VideoDataValidation {
  const validation: VideoDataValidation = {
    isValid: true,
    issues: [],
    warnings: [],
    recommendations: []
  };

  devLog(`🔍 [VIDEO-VALIDATOR] Validando dados de vídeo no contexto: ${context}`);

  if (!data) {
    validation.isValid = false;
    validation.issues.push('Dados de vídeo são null ou undefined');
    return validation;
  }

  // Verificar se há referências ao campo antigo video_url
  if (data.video_url && !data.url) {
    validation.isValid = false;
    validation.issues.push('Campo video_url encontrado - deve ser url');
    validation.recommendations.push('Migrar dados para usar campo url em vez de video_url');
  }

  // Verificar se há ambos os campos (inconsistência)
  if (data.video_url && data.url) {
    validation.warnings.push('Ambos campos video_url e url encontrados - potencial inconsistência');
    validation.recommendations.push('Limpar campo video_url antigo');
  }

  // Verificar se url está presente e válido
  if (!data.url) {
    validation.isValid = false;
    validation.issues.push('Campo url obrigatório está ausente');
  } else if (typeof data.url !== 'string' || data.url.trim() === '') {
    validation.isValid = false;
    validation.issues.push('Campo url está vazio ou inválido');
  }

  // Verificar estrutura esperada para vídeos Panda
  if (data.url && data.url.includes('pandavideo') || data.url.includes('panda')) {
    if (!data.video_id && !data.videoId) {
      validation.warnings.push('Vídeo Panda sem video_id - pode causar problemas de reprodução');
    }
  }

  // Log dos resultados
  if (!validation.isValid) {
    devWarn(`❌ [VIDEO-VALIDATOR] Dados inválidos em ${context}:`, validation.issues);
  } else if (validation.warnings.length > 0) {
    devWarn(`⚠️ [VIDEO-VALIDATOR] Avisos em ${context}:`, validation.warnings);
  } else {
    devLog(`✅ [VIDEO-VALIDATOR] Dados válidos em ${context}`);
  }

  return validation;
}

/**
 * Valida um array de dados de vídeo
 */
export function validateVideoArray(videos: any[], context: string = 'unknown'): VideoDataValidation {
  const overallValidation: VideoDataValidation = {
    isValid: true,
    issues: [],
    warnings: [],
    recommendations: []
  };

  devLog(`🔍 [VIDEO-VALIDATOR] Validando array de ${videos.length} vídeos no contexto: ${context}`);

  videos.forEach((video, index) => {
    const validation = validateVideoData(video, `${context}[${index}]`);
    
    if (!validation.isValid) {
      overallValidation.isValid = false;
      overallValidation.issues.push(...validation.issues.map(issue => `Vídeo ${index}: ${issue}`));
    }
    
    overallValidation.warnings.push(...validation.warnings.map(warning => `Vídeo ${index}: ${warning}`));
    overallValidation.recommendations.push(...validation.recommendations.map(rec => `Vídeo ${index}: ${rec}`));
  });

  return overallValidation;
}

/**
 * Detecta e reporta inconsistências de cache
 */
export function detectCacheInconsistencies(): void {
  devLog('🔍 [CACHE-VALIDATOR] Verificando inconsistências de cache...');
  
  const issues = [];
  
  // Verificar localStorage por referências antigas
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        const value = localStorage.getItem(key);
        if (value && value.includes('video_url')) {
          issues.push(`LocalStorage ${key} contém referências a video_url`);
        }
      } catch (e) {
        // Ignorar erros de parsing
      }
    }
  }
  
  // Verificar sessionStorage por referências antigas
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      try {
        const value = sessionStorage.getItem(key);
        if (value && value.includes('video_url')) {
          issues.push(`SessionStorage ${key} contém referências a video_url`);
        }
      } catch (e) {
        // Ignorar erros de parsing
      }
    }
  }
  
  if (issues.length > 0) {
    devWarn('⚠️ [CACHE-VALIDATOR] Inconsistências detectadas:', issues);
    devLog('💡 [CACHE-VALIDATOR] Recomendação: Execute clearAllLearningCache()');
  } else {
    devLog('✅ [CACHE-VALIDATOR] Nenhuma inconsistência detectada no cache');
  }
}

/**
 * Sanitiza dados de vídeo removendo campos antigos
 */
export function sanitizeVideoData(data: any): any {
  if (!data) return data;
  
  const sanitized = { ...data };
  
  // Se video_url existe mas url não, migrar
  if (sanitized.video_url && !sanitized.url) {
    sanitized.url = sanitized.video_url;
    delete sanitized.video_url;
    devLog('🔄 [VIDEO-SANITIZER] Migrado video_url para url');
  }
  
  // Se ambos existem, remover o antigo
  if (sanitized.video_url && sanitized.url) {
    delete sanitized.video_url;
    devLog('🗑️ [VIDEO-SANITIZER] Removido campo video_url duplicado');
  }
  
  return sanitized;
}