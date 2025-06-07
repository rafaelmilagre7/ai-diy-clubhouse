
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { SolutionCertificate } from '@/types/learningTypes';

export const useSolutionCertificates = (solutionId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar certificados de soluções do usuário
  const { data: certificates = [], isLoading, error } = useQuery({
    queryKey: ['solution-certificates', user?.id, solutionId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
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
        .order('issued_at', { ascending: false });

      if (solutionId) {
        query = query.eq('solution_id', solutionId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id
  });

  // Verificar elegibilidade para certificado
  const checkEligibility = async (solutionId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase.rpc('check_solution_certificate_eligibility', {
        p_user_id: user.id,
        p_solution_id: solutionId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao verificar elegibilidade:', error);
      return false;
    }
  };

  // Gerar certificado
  const generateCertificate = useMutation({
    mutationFn: async (solutionId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('create_solution_certificate_if_eligible', {
        p_user_id: user.id,
        p_solution_id: solutionId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Certificado gerado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['solution-certificates'] });
    },
    onError: (error: any) => {
      console.error('Erro ao gerar certificado:', error);
      if (error.message.includes('não é elegível')) {
        toast.error('Você precisa completar a implementação da solução para gerar o certificado.');
      } else if (error.message.includes('já possui certificado')) {
        toast.info('Você já possui um certificado para esta solução.');
      } else {
        toast.error('Erro ao gerar certificado. Tente novamente.');
      }
    }
  });

  // Download do certificado
  const downloadCertificate = async (certificateId: string) => {
    try {
      const certificate = certificates.find(c => c.id === certificateId);
      if (!certificate) {
        toast.error('Certificado não encontrado');
        return;
      }

      // Gerar PDF do certificado
      await generateCertificatePDF(certificate);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download do certificado');
    }
  };

  return {
    certificates,
    isLoading,
    error,
    checkEligibility,
    generateCertificate: generateCertificate.mutate,
    isGenerating: generateCertificate.isPending,
    downloadCertificate
  };
};

// Função auxiliar para gerar PDF do certificado
const generateCertificatePDF = async (certificate: any) => {
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
      .replace(/{{USER_NAME}}/g, certificate.profiles?.name || 'Usuário')
      .replace(/{{SOLUTION_TITLE}}/g, certificate.solutions?.title || 'Solução')
      .replace(/{{SOLUTION_CATEGORY}}/g, certificate.solutions?.category || 'Categoria')
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
    pdf.save(`certificado-${certificate.solutions?.title || 'solucao'}-${certificate.validation_code}.pdf`);

    // Remover elemento temporário
    document.body.removeChild(tempDiv);

    toast.success('Certificado baixado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error('Erro ao gerar PDF do certificado');
  }
};
