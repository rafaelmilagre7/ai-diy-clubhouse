import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { CERTIFICATE_LOGO_URL } from '@/lib/supabase/uploadCertificateLogo';
import { convertImageToBase64, generateCertificateHTML } from '@/utils/certificateUtils';

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

  // Download do certificado como PDF
  const downloadCertificate = async (certificate: any, userProfile: any) => {
    try {
      toast.loading('Gerando certificado PDF...', { id: 'download-loading' });
      
      console.log('Iniciando download do certificado...');
      console.log('URL da logo:', CERTIFICATE_LOGO_URL);
      
      // Importar bibliotecas dinamicamente
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas').then(module => module.default),
        import('jspdf').then(module => module.default)
      ]);

      console.log('Bibliotecas carregadas para download');

      // Converter logo para base64 - sem fallback
      console.log('Convertendo logo para base64...');
      const logoBase64 = await convertImageToBase64(CERTIFICATE_LOGO_URL);
      console.log('Logo convertida com sucesso, tamanho:', logoBase64.length);

      // Usar a data de emissão em vez da data de implementação
      const issuedDate = certificate.issued_at || certificate.implementation_date;
      const formattedDate = new Date(issuedDate).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Gerar HTML do certificado
      const htmlContent = generateCertificateHTML(certificate, userProfile, formattedDate, logoBase64);

      // Criar elemento temporário
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.innerHTML = htmlContent;
      
      document.body.appendChild(tempDiv);

      console.log('Elemento temporário criado para download, aguardando fontes...');
      
      // Aguardar fontes carregarem
      await new Promise(resolve => setTimeout(resolve, 4000));

      console.log('Capturando elemento como imagem para download...');
      
      // Capturar como imagem com dimensões A4 landscape
      const canvas = await html2canvas(tempDiv.querySelector('.certificate-container') as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        logging: true,
        width: 1123,
        height: 794
      });

      console.log('Canvas gerado para download:', canvas.width, 'x', canvas.height);

      // Gerar PDF com dimensões corretas
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Usar toda a área do A4 landscape (297x210mm)
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      
      // Fazer download
      pdf.save(`certificado-${certificate.solutions.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);

      // Remover elemento temporário
      document.body.removeChild(tempDiv);
      
      toast.success('Certificado baixado com sucesso!', { id: 'download-loading' });
      console.log('Download concluído com sucesso');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error(`Erro ao fazer download do certificado: ${error.message}`, { id: 'download-loading' });
    }
  };

  return {
    certificate: data?.certificate,
    isEligible: data?.isEligible || false,
    isLoading,
    error,
    generateCertificate: generateCertificate.mutate,
    isGenerating: generateCertificate.isPending,
    downloadCertificate
  };
};
