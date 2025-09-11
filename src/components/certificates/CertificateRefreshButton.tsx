import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Palette } from 'lucide-react';
import { useCertificateRefresh } from '@/hooks/certificates/useCertificateRefresh';
import { toast } from 'sonner';

interface CertificateRefreshButtonProps {
  variant?: 'refresh' | 'template';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const CertificateRefreshButton = ({ 
  variant = 'refresh', 
  size = 'default',
  className = ''
}: CertificateRefreshButtonProps) => {
  const { refreshCertificates, forceTemplateRegeneration } = useCertificateRefresh();

  const handleRefresh = () => {
    refreshCertificates();
    toast.success('Cache de certificados limpo!');
  };

  const handleTemplateUpdate = () => {
    forceTemplateRegeneration();
    toast.success('Template atualizado para versão 4.0 com novo design!', {
      description: 'Novos certificados usarão o fundo verde/turquesa'
    });
  };

  if (variant === 'template') {
    return (
      <Button
        onClick={handleTemplateUpdate}
        size={size}
        variant="outline"
        className={`bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 ${className}`}
      >
        <Palette className="w-4 h-4 mr-2" />
        Atualizar Design
      </Button>
    );
  }

  return (
    <Button
      onClick={handleRefresh}
      size={size}
      variant="outline"
      className={className}
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Atualizar Certificados
    </Button>
  );
};