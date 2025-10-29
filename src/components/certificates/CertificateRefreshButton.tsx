import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Palette } from 'lucide-react';
import { useCertificateRefresh } from '@/hooks/certificates/useCertificateRefresh';
import { useToastModern } from '@/hooks/useToastModern';

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
  const { showSuccess } = useToastModern();

  const handleRefresh = () => {
    refreshCertificates();
    showSuccess('Cache limpo!', 'Cache de certificados limpo');
  };

  const handleTemplateUpdate = () => {
    forceTemplateRegeneration();
    showSuccess('Template atualizado!', 'Template atualizado para versão 4.0 com novo design');
  };

  if (variant === 'template') {
    return (
      <Button
        onClick={handleTemplateUpdate}
        size={size}
        variant="outline"
        className={`bg-gradient-to-r from-system-healthy to-operational hover:from-system-healthy/90 hover:to-operational/90 text-primary-foreground border-0 ${className}`}
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