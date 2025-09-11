import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { templateEngine } from '@/utils/certificates/templateEngine';

export const useCertificateRefresh = () => {
  const queryClient = useQueryClient();

  const refreshCertificates = useCallback(() => {
    // Invalidar todas as queries relacionadas a certificados
    queryClient.invalidateQueries({ queryKey: ['certificates'] });
    queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
    queryClient.invalidateQueries({ queryKey: ['solution-certificates'] });
    queryClient.invalidateQueries({ queryKey: ['learning-certificates'] });
    
    // Limpar cache do template engine
    localStorage.removeItem('certificate-template-cache');
    
    console.log('✅ Cache de certificados limpo - novo design será aplicado');
  }, [queryClient]);

  const forceTemplateRegeneration = useCallback(() => {
    // Forçar regeneração do template padrão
    const newTemplate = templateEngine.generateDefaultTemplate();
    
    // Armazenar versão atualizada no localStorage temporariamente
    localStorage.setItem('certificate-template-updated', JSON.stringify({
      template: newTemplate,
      timestamp: Date.now(),
      version: '4.0'
    }));
    
    refreshCertificates();
    
    console.log('🎨 Template de certificado atualizado para versão 4.0');
  }, [refreshCertificates]);

  return {
    refreshCertificates,
    forceTemplateRegeneration
  };
};