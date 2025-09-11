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
    
    // Limpar cache do template engine e forçar versão 5.0
    localStorage.removeItem('certificate-template-cache');
    localStorage.setItem('certificate-template-updated', JSON.stringify({
      template: newTemplate,
      timestamp: Date.now(),
      version: '5.0-hardcoded'
    }));
    
    refreshCertificates();
    
    console.log('🎨 Template hardcoded VIVER DE IA neon ativo - versão 5.0');
  }, [refreshCertificates]);

  return {
    refreshCertificates,
    forceTemplateRegeneration
  };
};