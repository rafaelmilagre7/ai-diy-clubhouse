
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

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
      return data as SolutionCertificate[];
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

      // Gerar PDF básico do certificado
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      pdf.setFontSize(24);
      pdf.text('CERTIFICADO DE IMPLEMENTAÇÃO', 148, 50, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.text('Certificamos que', 148, 80, { align: 'center' });
      
      pdf.setFontSize(20);
      pdf.text('O usuário', 148, 100, { align: 'center' });
      
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

      pdf.save(`certificado-${certificate.solutions.title}-${certificate.validation_code}.pdf`);
      toast.success('Certificado baixado com sucesso!');
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
