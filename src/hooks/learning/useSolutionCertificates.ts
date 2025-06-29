
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

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

  // Gerar certificado usando função SQL
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
      if (error.message.includes('já possui certificado')) {
        toast.info('Você já possui um certificado para esta solução.');
      } else if (error.message.includes('não é elegível')) {
        toast.error('Você precisa completar a implementação da solução para gerar o certificado.');
      } else {
        toast.error('Erro ao gerar certificado. Tente novamente.');
      }
    }
  });

  // Download do certificado - retorna indicador se precisa abrir modal
  const downloadCertificate = async (certificateId: string): Promise<{ needsModal: boolean; certificate?: any }> => {
    try {
      const certificate = certificates.find(c => c.id === certificateId);
      if (!certificate) {
        toast.error('Certificado não encontrado');
        return { needsModal: false };
      }

      // Se já tem URL cacheada, fazer download direto
      if (certificate.certificate_url && certificate.certificate_filename) {
        const link = document.createElement('a');
        link.href = certificate.certificate_url;
        link.download = certificate.certificate_filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download iniciado!');
        return { needsModal: false };
      }

      // Se não tem cache, indicar que precisa abrir modal
      return { needsModal: true, certificate };
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download do certificado');
      return { needsModal: false };
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
