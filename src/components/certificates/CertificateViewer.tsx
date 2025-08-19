import React from 'react';
import { UnifiedCertificateViewer } from './UnifiedCertificateViewer';
import { CertificateData } from '@/utils/certificates/templateEngine';

interface CertificateViewerProps {
  userName: string;
  solutionTitle: string;
  completedDate: string;
  certificateId: string;
  onDownload?: () => void;
  onOpenInNewTab?: () => void;
  validationCode?: string;
  solutionCategory?: string;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({
  userName,
  solutionTitle,
  completedDate,
  certificateId,
  validationCode = certificateId,
  solutionCategory = "Solução de IA"
}) => {
  // Converter para formato unificado
  const certificateData: CertificateData = {
    userName,
    solutionTitle,
    implementationDate: completedDate,
    certificateId,
    validationCode,
    solutionCategory
  };

  return (
    <UnifiedCertificateViewer
      data={certificateData}
      headerTitle="Seu Certificado"
      headerDescription="Parabéns! Você conquistou este certificado ao concluir com sucesso a implementação."
      scale={0.7}
      className="max-w-6xl"
    />
  );
};