import { useState, useCallback, useEffect } from 'react';
import { storageUrlManager, StorageURLOptions } from '@/services/storageUrlManager';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

export const useSolutionCertificate = (solutionId: string) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [certificate, setCertificate] = useState<any | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchCertificateAndEligibility = async () => {
      setIsLoading(true);
      try {
        // Fetch certificate
        const { data: certificateData, error: certificateError } = await supabase
          .from('solution_certificates')
          .select('*')
          .eq('solution_id', solutionId)
          .eq('user_id', user?.id)
          .single();

        if (certificateError && certificateError.code !== 'PGRST116') {
          console.error("Erro ao buscar certificado:", certificateError);
          toast.error("Erro ao buscar certificado.");
        }

        setCertificate(certificateData);

        // Fetch eligibility
        const { data: eligibilityData, error: eligibilityError } = await supabase.rpc(
          'check_solution_certificate_eligibility',
          {
            p_user_id: user?.id,
            p_solution_id: solutionId,
          }
        );

        if (eligibilityError) {
          console.error("Erro ao verificar elegibilidade:", eligibilityError);
          toast.error("Erro ao verificar elegibilidade.");
        }

        setIsEligible(eligibilityData);
      } catch (error) {
        console.error("Erro geral ao buscar dados:", error);
        toast.error("Erro ao carregar dados do certificado.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id && solutionId) {
      fetchCertificateAndEligibility();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, solutionId]);

  const optimizeCertificateURL = useCallback(async (
    originalUrl: string,
    options: StorageURLOptions = {}
  ): Promise<string> => {
    if (!originalUrl) {
      return originalUrl;
    }

    try {
      console.log(`[useSolutionCertificate] Otimizando URL do certificado:`, originalUrl);

      const result = await storageUrlManager.optimizeCertificateURL(originalUrl, {
        enableTracking: true,
        priority: 'high',
        maxRetries: 3, // Corrigido: era 'retryAttempts', agora é 'maxRetries'
        ...options
      });

      return result.optimizedUrl;

    } catch (error) {
      console.error('[useSolutionCertificate] Erro na otimização da URL:', error);
      return originalUrl;
    }
  }, []);

  const downloadCertificate = useCallback(async (certificate: any, userProfile: any) => {
    if (!certificate) {
      toast.error('Certificado não encontrado');
      return;
    }

    try {
      // Buscar template do certificado
      const { data: template, error } = await supabase
        .from('solution_certificate_templates')
        .select('*')
        .eq('id', certificate.template_id)
        .single();

      if (error || !template) {
        toast.error('Template do certificado não encontrado');
        return;
      }

      // Criar elemento temporário para renderizar o certificado
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      
      // Substituir placeholders no template
      let htmlContent = template.html_template
        .replace(/{{USER_NAME}}/g, userProfile?.name || 'Usuário')
        .replace(/{{SOLUTION_TITLE}}/g, certificate.solution_title || 'Solução')
        .replace(/{{SOLUTION_CATEGORY}}/g, certificate.solution_category || 'Categoria')
        .replace(/{{IMPLEMENTATION_DATE}}/g, new Date(certificate.implementation_date).toLocaleDateString('pt-BR'))
        .replace(/{{VALIDATION_CODE}}/g, certificate.validation_code);

      tempDiv.innerHTML = htmlContent;
      
      // Adicionar estilos
      const styleSheet = document.createElement('style');
      styleSheet.textContent = template.css_styles || '';
      tempDiv.appendChild(styleSheet);
      
      document.body.appendChild(tempDiv);

      // Usar html2canvas para capturar o elemento
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      // Converter para PDF usando jsPDF
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Download do PDF
      pdf.save(`certificado-${certificate.solution_title || 'solucao'}-${certificate.validation_code}.pdf`);

      // Remover elemento temporário
      document.body.removeChild(tempDiv);

      toast.success('Certificado baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF do certificado');
    }
  }, []);

  const openCertificateInNewTab = useCallback(async (certificate: any, userProfile: any) => {
    if (!certificate) {
      toast.error('Certificado não encontrado');
      return;
    }

    try {
      // Buscar template do certificado
      const { data: template, error } = await supabase
        .from('solution_certificate_templates')
        .select('*')
        .eq('id', certificate.template_id)
        .single();

      if (error || !template) {
        toast.error('Template do certificado não encontrado');
        return;
      }

      // Criar elemento temporário para renderizar o certificado
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      
      // Substituir placeholders no template
      let htmlContent = template.html_template
        .replace(/{{USER_NAME}}/g, userProfile?.name || 'Usuário')
        .replace(/{{SOLUTION_TITLE}}/g, certificate.solution_title || 'Solução')
        .replace(/{{SOLUTION_CATEGORY}}/g, certificate.solution_category || 'Categoria')
        .replace(/{{IMPLEMENTATION_DATE}}/g, new Date(certificate.implementation_date).toLocaleDateString('pt-BR'))
        .replace(/{{VALIDATION_CODE}}/g, certificate.validation_code);

      tempDiv.innerHTML = htmlContent;
      
      // Adicionar estilos
      const styleSheet = document.createElement('style');
      styleSheet.textContent = template.css_styles || '';
      tempDiv.appendChild(styleSheet);
      
      document.body.appendChild(tempDiv);

      // Usar html2canvas para capturar o elemento
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');

      // Abrir em nova aba
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`<img src="${imgData}" alt="Certificado" style="width: 100%;" />`);
      } else {
        toast.error('Não foi possível abrir uma nova aba. Por favor, verifique as configurações do seu navegador.');
      }

      // Remover elemento temporário
      document.body.removeChild(tempDiv);

      toast.success('Certificado aberto em nova aba!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF do certificado');
    }
  }, []);

  const generateCertificate = useCallback(async () => {
    setIsGenerating(true);
    try {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('create_solution_certificate_if_eligible', {
        p_user_id: user.id,
        p_solution_id: solutionId
      });

      if (error) throw error;

      setCertificate(data);
      setIsEligible(true);
      toast.success('Certificado gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar certificado:', error);
      if (error.message.includes('não é elegível')) {
        toast.error('Você precisa completar a implementação da solução para gerar o certificado.');
      } else if (error.message.includes('já possui certificado')) {
        toast.info('Você já possui um certificado para esta solução.');
      } else {
        toast.error('Erro ao gerar certificado. Tente novamente.');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id, solutionId]);

  return {
    certificate,
    isEligible,
    isLoading,
    generateCertificate,
    isGenerating,
    downloadCertificate,
    openCertificateInNewTab
  };
};
