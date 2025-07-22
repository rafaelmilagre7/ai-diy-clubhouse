import { supabase } from '@/integrations/supabase/client';
import { generateCertificatePDF, CertificateData } from './certificateGenerator';

export interface StoredCertificate {
  id: string;
  certificateId: string;
  pdfUrl: string;
  filePath: string;
}

export const saveCertificateToStorage = async (
  certificateData: CertificateData,
  userId: string
): Promise<StoredCertificate> => {
  try {
    // Gerar PDF
    const pdfBlob = await generateCertificatePDF(certificateData);
    
    // Criar nome do arquivo
    const fileName = `certificado-${certificateData.solutionTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.pdf`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload para storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(filePath);
    
    return {
      id: certificateData.certificateId,
      certificateId: certificateData.certificateId,
      pdfUrl: publicUrl,
      filePath: filePath
    };
  } catch (error) {
    console.error('Erro ao salvar certificado no storage:', error);
    throw error;
  }
};

export const downloadCertificateFromStorage = async (pdfUrl: string, fileName: string) => {
  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error('Erro ao baixar certificado');
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao fazer download do certificado:', error);
    throw error;
  }
};

export const openCertificateFromStorage = (pdfUrl: string) => {
  window.open(pdfUrl, '_blank');
};