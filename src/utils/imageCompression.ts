
/**
 * Utilitário para compressão automática de imagens
 * Mantém qualidade visual enquanto reduz o tamanho do arquivo
 */

interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85, // 85% de qualidade
  maxSizeKB: 500, // 500KB máximo
  format: 'jpeg'
};

/**
 * Comprime uma imagem mantendo qualidade visual aceitável
 */
export const compressImage = async (
  file: File, 
  options: ImageCompressionOptions = {}
): Promise<File> => {
  // Se não for imagem, retornar sem compressão
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Se já for pequeno suficiente, não comprimir
  if (file.size <= (options.maxSizeKB || DEFAULT_OPTIONS.maxSizeKB) * 1024) {
    return file;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calcular novas dimensões mantendo proporção
        const { width: newWidth, height: newHeight } = calculateNewDimensions(
          img.width, 
          img.height, 
          opts.maxWidth, 
          opts.maxHeight
        );

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        // Determinar formato de saída
        const outputFormat = determineOutputFormat(file.type, opts.format);
        
        // Converter para blob com qualidade especificada
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha na compressão da imagem'));
              return;
            }

            // Criar novo arquivo com nome original
            const compressedFile = new File(
              [blob], 
              file.name, 
              { 
                type: outputFormat,
                lastModified: Date.now()
              }
            );

            console.log(`Imagem comprimida: ${file.size} bytes → ${compressedFile.size} bytes`);
            resolve(compressedFile);
          },
          outputFormat,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem para compressão'));
    };

    // Criar URL da imagem
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calcula novas dimensões mantendo proporção
 */
const calculateNewDimensions = (
  currentWidth: number,
  currentHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let { width, height } = { width: currentWidth, height: currentHeight };

  // Se já está dentro dos limites, não alterar
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calcular fator de escala
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
};

/**
 * Determina melhor formato de saída
 */
const determineOutputFormat = (
  originalType: string,
  preferredFormat: string
): string => {
  // Se original for PNG com transparência, manter PNG
  if (originalType === 'image/png') {
    return 'image/png';
  }

  // Para outros casos, usar formato preferido ou JPEG
  switch (preferredFormat) {
    case 'webp':
      return 'image/webp';
    case 'png':
      return 'image/png';
    default:
      return 'image/jpeg';
  }
};

/**
 * Valida se o arquivo é uma imagem suportada
 */
export const isValidImageFile = (file: File): boolean => {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  return supportedTypes.includes(file.type);
};

/**
 * Formata tamanho de arquivo para exibição
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
