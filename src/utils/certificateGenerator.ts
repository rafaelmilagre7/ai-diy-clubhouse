import { pdfGenerator } from './certificates/pdfGenerator';
import { CertificateData as UnifiedCertificateData } from './certificates/templateEngine';

// Manter interface legacy para compatibilidade
export interface CertificateData {
  userName: string;
  solutionTitle: string;
  completedDate: string;
  certificateId: string;
}

export const generateCertificatePDF = async (certificateData: CertificateData): Promise<Blob> => {
  console.log('⚠️  generateCertificatePDF: Usando sistema legado, considere migrar para o sistema unificado');
  
  // Converter para formato unificado
  const unifiedData: UnifiedCertificateData = {
    userName: certificateData.userName,
    solutionTitle: certificateData.solutionTitle,
    implementationDate: certificateData.completedDate,
    certificateId: certificateData.certificateId,
    validationCode: certificateData.certificateId,
    solutionCategory: "Solução de IA"
  };

  // Usar novo gerador
  return await pdfGenerator.generateFromHTML(
    '', // HTML será gerado pelo template padrão
    '', // CSS será gerado pelo template padrão  
    unifiedData
  );
};

export const downloadCertificate = async (certificateData: CertificateData) => {
  try {
    const pdfBlob = await generateCertificatePDF(certificateData);
    const filename = `certificado-${certificateData.solutionTitle.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
    
    await pdfGenerator.downloadPDF(pdfBlob, filename);
  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    throw error;
  }
};

export const openCertificateInNewTab = async (certificateData: CertificateData) => {
  try {
    const pdfBlob = await generateCertificatePDF(certificateData);
    await pdfGenerator.openPDFInNewTab(pdfBlob);
  } catch (error) {
    console.error('Erro ao abrir certificado:', error);
    throw error;
  }
};