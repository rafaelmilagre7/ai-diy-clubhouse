
import { logger } from './logger';

interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface FileSignature {
  extension: string;
  mimeType: string;
  magicNumbers: number[][];
}

// Assinaturas de arquivos conhecidas (magic numbers)
const FILE_SIGNATURES: FileSignature[] = [
  {
    extension: 'jpg',
    mimeType: 'image/jpeg',
    magicNumbers: [[0xFF, 0xD8, 0xFF]]
  },
  {
    extension: 'png',
    mimeType: 'image/png',
    magicNumbers: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]]
  },
  {
    extension: 'pdf',
    mimeType: 'application/pdf',
    magicNumbers: [[0x25, 0x50, 0x44, 0x46]]
  },
  {
    extension: 'mp4',
    mimeType: 'video/mp4',
    magicNumbers: [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]]
  },
  {
    extension: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    magicNumbers: [[0x50, 0x4B, 0x03, 0x04]]
  }
];

class FileValidator {
  private static instance: FileValidator;
  
  private constructor() {}
  
  static getInstance(): FileValidator {
    if (!FileValidator.instance) {
      FileValidator.instance = new FileValidator();
    }
    return FileValidator.instance;
  }

  async validateFile(file: File, allowedTypes: string[] = [], maxSizeMB: number = 10): Promise<FileValidationResult> {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Validação básica
      this.validateBasicProperties(file, allowedTypes, maxSizeMB, result);
      
      // Validação de assinatura (magic numbers)
      await this.validateFileSignature(file, result);
      
      // Validação de nome de arquivo
      this.validateFileName(file.name, result);
      
      // Verificações de segurança adicionais
      this.performSecurityChecks(file, result);

    } catch (error) {
      logger.error('Erro durante validação de arquivo', {
        component: 'FILE_VALIDATOR',
        fileName: file.name,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      result.isValid = false;
      result.errors.push('Erro interno durante validação do arquivo');
    }

    result.isValid = result.errors.length === 0;
    
    logger.info('Validação de arquivo concluída', {
      component: 'FILE_VALIDATOR',
      fileName: file.name,
      isValid: result.isValid,
      errorsCount: result.errors.length,
      warningsCount: result.warnings.length
    });

    return result;
  }

  private validateBasicProperties(
    file: File, 
    allowedTypes: string[], 
    maxSizeMB: number, 
    result: FileValidationResult
  ): void {
    // Verificar tipo de arquivo
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      result.errors.push(
        `Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}`
      );
    }

    // Verificar tamanho
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      result.errors.push(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
    }

    // Verificar se o arquivo não está vazio
    if (file.size === 0) {
      result.errors.push('Arquivo está vazio');
    }
  }

  private async validateFileSignature(file: File, result: FileValidationResult): Promise<void> {
    try {
      const buffer = await this.readFileHeader(file, 32); // Ler primeiros 32 bytes
      const signature = this.findMatchingSignature(buffer, file.type);

      if (!signature) {
        result.warnings.push('Não foi possível verificar a assinatura do arquivo');
        return;
      }

      const isValidSignature = this.verifySignature(buffer, signature.magicNumbers);
      
      if (!isValidSignature) {
        result.errors.push(
          'Assinatura do arquivo não corresponde ao tipo declarado (possível arquivo corrompido ou malicioso)'
        );
      }

    } catch (error) {
      result.warnings.push('Erro ao verificar assinatura do arquivo');
      logger.warn('Erro na verificação de assinatura', {
        component: 'FILE_VALIDATOR',
        fileName: file.name,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  private validateFileName(fileName: string, result: FileValidationResult): void {
    // Verificar comprimento do nome
    if (fileName.length > 255) {
      result.errors.push('Nome do arquivo muito longo (máximo 255 caracteres)');
    }

    // Verificar caracteres perigosos
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(fileName)) {
      result.errors.push('Nome do arquivo contém caracteres inválidos');
    }

    // Verificar nomes de arquivo reservados (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    if (reservedNames.test(fileName)) {
      result.errors.push('Nome do arquivo é reservado pelo sistema');
    }

    // Verificar múltiplas extensões (possível tentativa de bypass)
    const extensionCount = (fileName.match(/\./g) || []).length;
    if (extensionCount > 1) {
      result.warnings.push('Arquivo possui múltiplas extensões');
    }
  }

  private performSecurityChecks(file: File, result: FileValidationResult): void {
    // Verificar tipos MIME perigosos
    const dangerousMimeTypes = [
      'application/x-executable',
      'application/x-msdownload',
      'application/x-sh',
      'text/javascript',
      'application/javascript'
    ];

    if (dangerousMimeTypes.includes(file.type)) {
      result.errors.push('Tipo de arquivo potencialmente perigoso não permitido');
    }

    // Verificar extensões executáveis
    const dangerousExtensions = /\.(exe|bat|cmd|scr|pif|com|jar|js|vbs|ps1)$/i;
    if (dangerousExtensions.test(file.name)) {
      result.errors.push('Extensão de arquivo executável não permitida');
    }
  }

  private async readFileHeader(file: File, bytesToRead: number): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(reader.result));
        } else {
          reject(new Error('Erro ao ler arquivo como ArrayBuffer'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      
      const blob = file.slice(0, bytesToRead);
      reader.readAsArrayBuffer(blob);
    });
  }

  private findMatchingSignature(buffer: Uint8Array, mimeType: string): FileSignature | undefined {
    return FILE_SIGNATURES.find(sig => sig.mimeType === mimeType);
  }

  private verifySignature(buffer: Uint8Array, magicNumbers: number[][]): boolean {
    return magicNumbers.some(signature => {
      if (buffer.length < signature.length) return false;
      
      return signature.every((byte, index) => buffer[index] === byte);
    });
  }
}

export const fileValidator = FileValidator.getInstance();

// Função de conveniência para validação rápida
export const validateFileUpload = async (
  file: File, 
  allowedTypes: string[] = [], 
  maxSizeMB: number = 10
): Promise<FileValidationResult> => {
  return fileValidator.validateFile(file, allowedTypes, maxSizeMB);
};
