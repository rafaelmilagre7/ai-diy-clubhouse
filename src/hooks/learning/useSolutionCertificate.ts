
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { CERTIFICATE_LOGO_URL } from '@/lib/supabase/uploadCertificateLogo';
import { 
  convertImageToBase64, 
  generateCertificateHTML, 
  generateCertificateFileName,
  uploadCertificateToStorage,
  updateCertificateRecord
} from '@/utils/certificateUtils';

export const useSolutionCertificate = (solutionId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar certificado existente e verificar elegibilidade
  const { data, isLoading, error } = useQuery({
    queryKey: ['solution-certificate', user?.id, solutionId],
    queryFn: async () => {
      if (!user?.id) return { certificate: null, isEligible: false, progress: null };
      
      console.log('Buscando certificado para solução:', solutionId);
      
      // Primeiro, verificar se já existe um certificado
      const { data: existingCert, error: certError } = await supabase
        .from('solution_certificates')
        .select(`
          *,
          solutions (
            id,
            title,
            category,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .maybeSingle();

      if (certError) {
        console.error('Erro ao buscar certificado:', certError);
      }

      // Verificar se o usuário completou a solução
      const { data: progress, error: progressError } = await supabase
        .from('progress')
        .select(`
          *,
          solutions (
            id,
            title,
            category,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .maybeSingle();

      if (progressError) {
        console.error('Erro ao buscar progresso:', progressError);
      }

      const isEligible = progress?.is_completed === true;
      
      console.log('Dados encontrados:', {
        existingCert: !!existingCert,
        progress: !!progress,
        isCompleted: progress?.is_completed,
        isEligible
      });

      // Se é elegível mas não tem certificado, gerar automaticamente
      if (isEligible && !existingCert && progress?.solutions) {
        console.log('Gerando certificado automaticamente...');
        
        // Gerar código de validação
        const validationCode = Array.from({ length: 12 }, () => 
          'ABCDEFGHJKMNPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 34)]
        ).join('');

        try {
          const { data: newCert, error: createError } = await supabase
            .from('solution_certificates')
            .insert({
              user_id: user.id,
              solution_id: solutionId,
              implementation_date: progress.completed_at || progress.updated_at,
              validation_code: validationCode,
              issued_at: new Date().toISOString()
            })
            .select(`
              *,
              solutions (
                id,
                title,
                category,
                description
              )
            `)
            .single();

          if (createError) {
            console.error('Erro ao criar certificado:', createError);
            throw createError;
          }

          console.log('Certificado criado:', newCert);
          return {
            certificate: newCert,
            isEligible: true,
            progress
          };
        } catch (error) {
          console.error('Falha ao gerar certificado:', error);
          return {
            certificate: null,
            isEligible: true,
            progress
          };
        }
      }

      return {
        certificate: existingCert,
        isEligible,
        progress
      };
    },
    enabled: !!user?.id && !!solutionId
  });

  // Gerar certificado manualmente
  const generateCertificate = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Verificar se é elegível
      const { data: progress, error: progressError } = await supabase
        .from('progress')
        .select(`
          *,
          solutions (
            id,
            title,
            category,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .eq('is_completed', true)
        .single();

      if (progressError || !progress) {
        throw new Error('Você precisa completar a implementação da solução primeiro');
      }

      // Gerar código de validação
      const validationCode = Array.from({ length: 12 }, () => 
        'ABCDEFGHJKMNPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 34)]
      ).join('');

      // Criar certificado
      const { data: certificate, error: createError } = await supabase
        .from('solution_certificates')
        .insert({
          user_id: user.id,
          solution_id: solutionId,
          implementation_date: progress.completed_at || progress.updated_at,
          validation_code: validationCode,
          issued_at: new Date().toISOString()
        })
        .select(`
          *,
          solutions (
            id,
            title,
            category,
            description
          )
        `)
        .single();

      if (createError) throw createError;
      return certificate;
    },
    onSuccess: () => {
      toast.success('Certificado gerado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['solution-certificate'] });
    },
    onError: (error: any) => {
      console.error('Erro ao gerar certificado:', error);
      toast.error(error.message || 'Erro ao gerar certificado. Tente novamente.');
    }
  });

  // Função para gerar PDF e fazer cache
  const generateAndCachePDF = async (certificate: any, userProfile: any) => {
    try {
      console.log('Iniciando geração e cache do PDF...');
      
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas').then(module => module.default),
        import('jspdf').then(module => module.default)
      ]);

      const logoBase64 = await convertImageToBase64(CERTIFICATE_LOGO_URL);
      
      const issuedDate = certificate.issued_at || certificate.implementation_date;
      const formattedDate = new Date(issuedDate).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const htmlContent = generateCertificateHTML(certificate, userProfile, formattedDate, logoBase64);

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.innerHTML = htmlContent;
      
      document.body.appendChild(tempDiv);
      await new Promise(resolve => setTimeout(resolve, 3000));

      const canvas = await html2canvas(tempDiv.querySelector('.certificate-container') as HTMLElement, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        logging: false,
        width: 1123,
        height: 794
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      
      const pdfBlob = pdf.output('blob');
      
      // Gerar nome personalizado
      const fileName = generateCertificateFileName(userProfile.name, certificate.solutions.title);
      
      // Fazer upload para o storage
      const certificateUrl = await uploadCertificateToStorage(pdfBlob, fileName, certificate.id);
      
      // Atualizar registro do certificado
      await updateCertificateRecord(certificate.id, certificateUrl, fileName);
      
      document.body.removeChild(tempDiv);
      
      console.log('PDF gerado e armazenado com sucesso');
      
      return { pdfBlob, certificateUrl, fileName };
    } catch (error) {
      console.error('Erro ao gerar e cachear PDF:', error);
      throw error;
    }
  };

  // Download do certificado como PDF
  const downloadCertificate = async (certificate: any, userProfile: any) => {
    try {
      toast.loading('Preparando download do certificado...', { id: 'download-loading' });
      
      console.log('Iniciando download do certificado...');
      
      // Verificar se já existe cache
      if (certificate.certificate_url && certificate.certificate_filename) {
        console.log('Usando certificado do cache:', certificate.certificate_url);
        
        try {
          // Tentar baixar do cache
          const response = await fetch(certificate.certificate_url);
          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = certificate.certificate_filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast.success('Certificado baixado com sucesso!', { id: 'download-loading' });
            return;
          }
        } catch (cacheError) {
          console.warn('Cache não disponível, gerando novo PDF:', cacheError);
        }
      }
      
      // Se não tem cache ou cache falhou, gerar novo PDF
      console.log('Gerando novo PDF para download...');
      const { pdfBlob, fileName } = await generateAndCachePDF(certificate, userProfile);
      
      // Download do PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Invalidar query para atualizar dados do certificado
      queryClient.invalidateQueries({ queryKey: ['solution-certificate'] });
      
      toast.success('Certificado baixado com sucesso!', { id: 'download-loading' });
      console.log('Download concluído com sucesso');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error(`Erro ao fazer download do certificado: ${error.message}`, { id: 'download-loading' });
    }
  };

  // Abrir certificado em nova guia
  const openCertificateInNewTab = async (certificate: any, userProfile: any) => {
    try {
      toast.loading('Preparando certificado...', { id: 'pdf-loading' });
      
      console.log('Abrindo certificado em nova guia...');
      
      // Verificar se já existe cache
      if (certificate.certificate_url) {
        console.log('Usando certificado do cache:', certificate.certificate_url);
        
        try {
          // Tentar abrir do cache
          const response = await fetch(certificate.certificate_url);
          if (response.ok) {
            const newWindow = window.open(certificate.certificate_url, '_blank');
            if (!newWindow) {
              throw new Error('Pop-ups bloqueados. Permita pop-ups para abrir o certificado.');
            }
            
            toast.success('Certificado aberto em nova guia!', { id: 'pdf-loading' });
            return;
          }
        } catch (cacheError) {
          console.warn('Cache não disponível, gerando novo PDF:', cacheError);
        }
      }
      
      // Se não tem cache ou cache falhou, gerar novo PDF
      console.log('Gerando novo PDF para abrir em nova guia...');
      const { pdfBlob } = await generateAndCachePDF(certificate, userProfile);
      
      // Abrir PDF em nova guia
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfUrl, '_blank');
      if (!newWindow) {
        throw new Error('Pop-ups bloqueados. Permita pop-ups para abrir o certificado.');
      }

      toast.success('Certificado aberto em nova guia!', { id: 'pdf-loading' });
      
      // Invalidar query para atualizar dados do certificado
      queryClient.invalidateQueries({ queryKey: ['solution-certificate'] });
      
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
      
    } catch (error) {
      console.error('Erro ao abrir certificado em nova guia:', error);
      toast.error(`Erro ao abrir certificado: ${error.message}`, { id: 'pdf-loading' });
    }
  };

  return {
    certificate: data?.certificate,
    isEligible: data?.isEligible || false,
    isLoading,
    error,
    generateCertificate: generateCertificate.mutate,
    isGenerating: generateCertificate.isPending,
    downloadCertificate,
    openCertificateInNewTab
  };
};
