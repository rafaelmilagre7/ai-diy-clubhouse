/**
 * Utilitários de segurança para upload de imagens
 * 
 * Implementa validações e sanitização para uploads seguros
 */

// Tipos de arquivo permitidos
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp'
] as const;

// Extensões permitidas
export const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp'
] as const;

// Tamanho máximo: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Valida se o arquivo é uma imagem válida
 */
export const validateImageFile = (file: File): {
  isValid: boolean;
  error?: string;
} => {
  // Verificar tipo MIME
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido: ${file.type}. Use: JPEG, PNG, GIF ou WebP`
    };
  }
  
  // Verificar extensão
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension as any)) {
    return {
      isValid: false,
      error: `Extensão não permitida: ${extension}. Use: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }
  
  // Verificar tamanho
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(1);
    return {
      isValid: false,
      error: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)}MB. Máximo: ${sizeMB}MB`
    };
  }
  
  // Verificar se não está vazio
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'Arquivo está vazio'
    };
  }
  
  return { isValid: true };
};

/**
 * Sanitiza nome do arquivo removendo caracteres perigosos
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Substituir caracteres especiais por underscore
    .replace(/_{2,}/g, '_') // Substituir múltiplos underscores por um
    .replace(/^_+|_+$/g, '') // Remover underscores no início e fim
    .toLowerCase();
};

/**
 * Gera um nome único para o arquivo
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = sanitizeFileName(originalName);
  const nameWithoutExt = sanitized.replace(/\.[^/.]+$/, "");
  const extension = sanitized.split('.').pop();
  
  return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
};

/**
 * Detecta tentativas de upload malicioso
 */
export const detectMaliciousUpload = (file: File): {
  isSuspicious: boolean;
  reasons: string[];
} => {
  const reasons: string[] = [];
  
  // Verificar nomes suspeitos
  const suspiciousPatterns = [
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i,
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.html$/i,
    /\.htm$/i,
    /script/i,
    /payload/i,
    /exploit/i,
    /hack/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      reasons.push(`Nome de arquivo suspeito: ${file.name}`);
      break;
    }
  }
  
  // Verificar tipo vs extensão (double extension attack)
  const extension = file.name.split('.').pop()?.toLowerCase();
  const expectedMimes: Record<string, string[]> = {
    'jpg': ['image/jpeg'],
    'jpeg': ['image/jpeg'], 
    'png': ['image/png'],
    'gif': ['image/gif'],
    'webp': ['image/webp']
  };
  
  if (extension && expectedMimes[extension]) {
    if (!expectedMimes[extension].includes(file.type)) {
      reasons.push(`Tipo MIME não corresponde à extensão: ${file.type} vs .${extension}`);
    }
  }
  
  // Verificar tamanho suspeito (muito pequeno pode ser tentativa de bypass)
  if (file.size < 100) {
    reasons.push('Arquivo suspeito: muito pequeno');
  }
  
  return {
    isSuspicious: reasons.length > 0,
    reasons
  };
};

/**
 * Função principal para validação completa de segurança
 */
export const validateImageUploadSecurity = (file: File): {
  isSecure: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validação básica
  const basicValidation = validateImageFile(file);
  if (!basicValidation.isValid && basicValidation.error) {
    errors.push(basicValidation.error);
  }
  
  // Detecção de malware/suspeitos
  const malwareCheck = detectMaliciousUpload(file);
  if (malwareCheck.isSuspicious) {
    warnings.push(...malwareCheck.reasons);
  }
  
  return {
    isSecure: errors.length === 0 && warnings.length === 0,
    errors,
    warnings
  };
};