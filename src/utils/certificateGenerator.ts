// Legacy file - DEPRECATED
// Este arquivo é mantido apenas para compatibilidade com código antigo
// Use o sistema unificado em /utils/certificates/ diretamente

import { pdfGenerator } from './certificates/pdfGenerator';
import { templateEngine, CertificateData as UnifiedCertificateData } from './certificates/templateEngine';

// Interface legacy para compatibilidade
export interface CertificateData {
  userName: string;
  solutionTitle: string;
  completedDate: string;
  certificateId: string;
}

export const generateCertificatePDF = async (certificateData: CertificateData): Promise<Blob> => {
  console.warn('⚠️ generateCertificatePDF: Sistema legacy em uso - migre para o sistema unificado');
  
  // Converter para formato unificado
  const unifiedData: UnifiedCertificateData = {
    userName: certificateData.userName,
    solutionTitle: certificateData.solutionTitle,
    implementationDate: certificateData.completedDate,
    certificateId: certificateData.certificateId,
    validationCode: certificateData.certificateId,
    solutionCategory: "Solução de IA"
  };

  // Usar sistema unificado
  const template = templateEngine.generateDefaultTemplate();
  const html = templateEngine.processTemplate(template, unifiedData);
  const css = templateEngine.optimizeCSS(template.css_styles);

  return await pdfGenerator.generateFromHTML(html, css, unifiedData);
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