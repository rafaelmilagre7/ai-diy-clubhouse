import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificateViewerProps {
  userName: string;
  solutionTitle: string;
  completedDate: string;
  certificateId: string;
  onDownload: () => void;
  onOpenInNewTab: () => void;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({
  userName,
  solutionTitle,
  completedDate,
  certificateId,
  onDownload,
  onOpenInNewTab
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto bg-gradient-to-br from-white via-blue-50 to-indigo-100 p-8 rounded-lg shadow-2xl border-4 border-gradient-to-r from-primary to-secondary">
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-lg"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-lg"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-lg"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-lg"></div>
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mb-4">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Certificado de Conclusão</h1>
        <p className="text-lg text-gray-600">VIA - Viverde IA</p>
      </div>
      
      {/* Content */}
      <div className="text-center mb-8">
        <p className="text-lg text-gray-700 mb-4">
          Certificamos que
        </p>
        
        <h2 className="text-3xl font-bold text-primary mb-6 py-2 border-b-2 border-primary/30">
          {userName}
        </h2>
        
        <p className="text-lg text-gray-700 mb-4">
          concluiu com sucesso a implementação da solução
        </p>
        
        <h3 className="text-2xl font-semibold text-secondary mb-6">
          "{solutionTitle}"
        </h3>
        
        <p className="text-gray-600 mb-8">
          demonstrando dedicação e competência na aplicação de soluções de Inteligência Artificial
        </p>
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-end">
        <div className="text-left">
          <p className="text-sm text-gray-600">Data de Conclusão:</p>
          <p className="font-semibold text-gray-800">{completedDate}</p>
        </div>
        
        <div className="text-center">
          <div className="w-32 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mb-2">
            <span className="text-xs font-semibold text-primary">ASSINATURA DIGITAL</span>
          </div>
          <p className="text-xs text-gray-500">Certificado ID: {certificateId}</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Emitido por:</p>
          <p className="font-semibold text-gray-800">VIA - Viverde IA</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
        <Button onClick={onDownload} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Baixar PDF
        </Button>
        
        <Button onClick={onOpenInNewTab} variant="outline" className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Abrir em Nova Guia
        </Button>
      </div>
    </div>
  );
};