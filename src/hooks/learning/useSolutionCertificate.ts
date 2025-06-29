
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SolutionCertificate {
  id: string;
  user_id: string;
  solution_id: string;
  template_id?: string;
  validation_code: string;
  implementation_date: string;
  certificate_url?: string;
  certificate_filename?: string;
  issued_at: string;
  solutions: {
    title: string;
    category: string;
    description?: string;
  };
}

export const useSolutionCertificate = (solutionId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEligible, setIsEligible] = useState<boolean | null>(null);

  // Buscar certificado existente
  const { data: certificate, isLoading } = useQuery({
    queryKey: ['solution-certificate', user?.id, solutionId],
    queryFn: async () => {
      if (!user?.id || !solutionId) return null;
      
      const { data, error } = await supabase
        .from('solution_certificates')
        .select(`
          *,
          solutions (
            title,
            category,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar certificado:', error);
        return null;
      }
      
      return data as SolutionCertificate | null;
    },
    enabled: !!user?.id && !!solutionId
  });

  // Verificar elegibilidade
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user?.id || !solutionId || certificate) return;
      
      try {
        const { data, error } = await supabase.rpc('check_solution_certificate_eligibility', {
          p_user_id: user.id,
          p_solution_id: solutionId
        });

        if (error) {
          console.error('Erro ao verificar elegibilidade:', error);
          setIsEligible(false);
        } else {
          setIsEligible(data || false);
        }
      } catch (error) {
        console.error('Erro ao verificar elegibilidade:', error);
        setIsEligible(false);
      }
    };

    checkEligibility();
  }, [user?.id, solutionId, certificate]);

  // Gerar certificado
  const generateCertificate = useMutation({
    mutationFn: async () => {
      if (!user?.id || !solutionId) throw new Error('Usuário ou solução não identificados');

      // Verificar elegibilidade antes de gerar
      const { data: eligible, error: eligibilityError } = await supabase.rpc('check_solution_certificate_eligibility', {
        p_user_id: user.id,
        p_solution_id: solutionId
      });

      if (eligibilityError || !eligible) {
        throw new Error('Você não é elegível para este certificado. Complete a implementação da solução primeiro.');
      }

      // Buscar dados da implementação
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .eq('is_completed', true)
        .single();

      if (progressError) {
        throw new Error('Dados de implementação não encontrados');
      }

      // Criar certificado
      const { data, error } = await supabase
        .from('solution_certificates')
        .insert({
          user_id: user.id,
          solution_id: solutionId,
          implementation_date: progressData.completed_at || new Date().toISOString()
        })
        .select(`
          *,
          solutions (
            title,
            category,
            description
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Certificado gerado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['solution-certificate'] });
    },
    onError: (error: any) => {
      console.error('Erro ao gerar certificado:', error);
      toast.error(error.message || 'Erro ao gerar certificado');
    }
  });

  // Download do certificado
  const downloadCertificate = async (certificate: SolutionCertificate, userProfile: any) => {
    try {
      if (certificate.certificate_url && certificate.certificate_filename) {
        // Se já tem PDF cached, fazer download direto
        const response = await fetch(certificate.certificate_url);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = certificate.certificate_filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return;
        }
      }

      // Gerar PDF dinamicamente
      await generatePDF(certificate, userProfile);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download do certificado');
    }
  };

  // Abrir certificado em nova aba
  const openCertificateInNewTab = async (certificate: SolutionCertificate, userProfile: any) => {
    try {
      if (certificate.certificate_url) {
        window.open(certificate.certificate_url, '_blank');
        return;
      }

      // Gerar PDF e abrir
      const pdfBlob = await generatePDFBlob(certificate, userProfile);
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao abrir certificado:', error);
      toast.error('Erro ao abrir certificado');
    }
  };

  // Função auxiliar para gerar PDF
  const generatePDF = async (certificate: SolutionCertificate, userProfile: any) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Conteúdo básico do certificado
    pdf.setFontSize(24);
    pdf.text('CERTIFICADO DE IMPLEMENTAÇÃO', 148, 50, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text('Certificamos que', 148, 80, { align: 'center' });
    
    pdf.setFontSize(20);
    pdf.text(userProfile.name, 148, 100, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text('concluiu com sucesso a implementação da solução', 148, 120, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text(certificate.solutions.title, 148, 140, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Categoria: ${certificate.solutions.category}`, 148, 160, { align: 'center' });
    
    pdf.setFontSize(14);
    const implementationDate = new Date(certificate.implementation_date).toLocaleDateString('pt-BR');
    pdf.text(`em ${implementationDate}`, 148, 180, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text(`Código de Validação: ${certificate.validation_code}`, 148, 200, { align: 'center' });

    // Download
    pdf.save(`certificado-${certificate.solutions.title}-${certificate.validation_code}.pdf`);
  };

  // Função auxiliar para gerar PDF como blob
  const generatePDFBlob = async (certificate: SolutionCertificate, userProfile: any): Promise<Blob> => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Mesmo conteúdo da função generatePDF
    pdf.setFontSize(24);
    pdf.text('CERTIFICADO DE IMPLEMENTAÇÃO', 148, 50, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text('Certificamos que', 148, 80, { align: 'center' });
    
    pdf.setFontSize(20);
    pdf.text(userProfile.name, 148, 100, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text('concluiu com sucesso a implementação da solução', 148, 120, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text(certificate.solutions.title, 148, 140, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Categoria: ${certificate.solutions.category}`, 148, 160, { align: 'center' });
    
    pdf.setFontSize(14);
    const implementationDate = new Date(certificate.implementation_date).toLocaleDateString('pt-BR');
    pdf.text(`em ${implementationDate}`, 148, 180, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text(`Código de Validação: ${certificate.validation_code}`, 148, 200, { align: 'center' });

    return pdf.output('blob');
  };

  return {
    certificate,
    isEligible,
    isLoading,
    generateCertificate: generateCertificate.mutate,
    isGenerating: generateCertificate.isPending,
    downloadCertificate,
    openCertificateInNewTab
  };
};
