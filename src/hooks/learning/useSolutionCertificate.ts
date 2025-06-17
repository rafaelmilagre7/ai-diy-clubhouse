import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useUser } from '@/hooks/useUser';
import { useCertificateURL } from '@/hooks/useCertificateURL';
import { toast } from 'sonner';
import { Profile } from '@/types/forumTypes';

interface SolutionCertificate {
  id: string;
  created_at: string;
  user_id: string;
  solution_id: string;
  certificate_url: string;
  validation_code: string;
  template_id: string;
  implementation_date: string;
  issued_at: string;
  profiles?: Profile;
  solutions?: {
    id: string;
    title: string;
    category: string;
    description: string;
  };
}

export const useSolutionCertificate = (solutionId: string) => {
  const { user } = useAuth();
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const { optimizeCertificateURL, validateCertificateURL } = useCertificateURL();

  const [isEligible, setIsEligible] = useState(false);
  const [certificatePDFUrl, setCertificatePDFUrl] = useState<string | null>(null);

  // Buscar certificado do usuário para a solução
  const { data: certificate, isLoading, error } = useQuery({
    queryKey: ['solution-certificate', user?.id, solutionId],
    queryFn: async () => {
      if (!user?.id || !solutionId) return null;

      const { data, error } = await supabase
        .from('solution_certificates')
        .select(`
          *,
          profiles (
            name,
            email,
            avatar_url
          ),
          solutions (
            id,
            title,
            category,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .single();

      if (error) throw error;
      return data as SolutionCertificate;
    },
    enabled: !!user?.id && !!solutionId,
    retry: false
  });

  // Verificar elegibilidade ao carregar o hook
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user?.id || !solutionId) return;

      try {
        const { data, error } = await supabase.rpc('check_solution_certificate_eligibility', {
          p_user_id: user.id,
          p_solution_id: solutionId
        });

        if (error) throw error;
        setIsEligible(data);
      } catch (error) {
        console.error('Erro ao verificar elegibilidade:', error);
        setIsEligible(false);
      }
    };

    checkEligibility();
  }, [user?.id, solutionId]);

  // Mutation para gerar o certificado
  const generateCertificate = useMutation({
    mutationFn: async () => {
      if (!user?.id || !solutionId) throw new Error('Usuário ou solução inválidos');

      const { data, error } = await supabase.rpc('create_solution_certificate_if_eligible', {
        p_user_id: user.id,
        p_solution_id: solutionId
      });

      if (error) {
        console.error('Erro ao gerar certificado (RPC):', error);
        throw error;
      }

      // Invalida a query para refetch
      queryClient.invalidateQueries({ queryKey: ['solution-certificate', user.id, solutionId] });
      return data;
    },
    onSuccess: () => {
      toast.success('Certificado gerado com sucesso!');
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

  // Função para fazer download do certificado
  const downloadCertificate = async (certificate: SolutionCertificate, userProfile: Profile) => {
    if (!certificate) {
      toast.error('Certificado não encontrado');
      return;
    }

    try {
      // 1. Otimizar a URL do certificado
      const optimizedUrl = await optimizeCertificateURL(certificate.certificate_url, {
        priority: 'high',
        maxRetries: 3
      });
      console.log('URL otimizada:', optimizedUrl);

      // 2. Validar a URL otimizada
      const isValid = await validateCertificateURL(optimizedUrl);
      if (!isValid) {
        throw new Error('URL do certificado inválida após otimização');
      }

      // 3. Abrir em nova aba
      window.open(optimizedUrl, '_blank');

      toast.success('Download iniciado em nova aba!');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download do certificado');
    }
  };

  // Função para abrir o certificado em nova aba
  const openCertificateInNewTab = async (certificate: SolutionCertificate, userProfile: Profile) => {
    if (!certificate) {
      toast.error('Certificado não encontrado');
      return;
    }

    try {
      // 1. Otimizar a URL do certificado
      const optimizedUrl = await optimizeCertificateURL(certificate.certificate_url, {
        priority: 'high',
        maxRetries: 3
      });
      console.log('URL otimizada:', optimizedUrl);

      // 2. Validar a URL otimizada
      const isValid = await validateCertificateURL(optimizedUrl);
      if (!isValid) {
        throw new Error('URL do certificado inválida após otimização');
      }

      // 3. Abrir em nova aba
      window.open(optimizedUrl, '_blank');

      toast.success('Certificado aberto em nova aba!');
    } catch (error) {
      console.error('Erro ao abrir em nova aba:', error);
      toast.error('Erro ao abrir certificado em nova aba');
    }
  };

  return {
    certificate,
    isEligible,
    isLoading,
    error,
    generateCertificate: generateCertificate.mutate,
    isGenerating: generateCertificate.isPending,
    downloadCertificate,
    openCertificateInNewTab
  };
};
