
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { toast } from 'sonner';

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string;
  validation_code: string;
  issued_at: string;
  created_at: string;
}

export const useCertificates = () => {
  const { user } = useSimpleAuth();
  const queryClient = useQueryClient();

  // Get user certificates
  const {
    data: certificates = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async (): Promise<Certificate[]> => {
      if (!user?.id) return [];

      console.log('Simulando busca de certificados do usuário:', user.id);
      
      // Mock certificates data since table doesn't exist
      return [
        {
          id: '1',
          user_id: user.id,
          course_id: '1',
          certificate_url: '/certificates/sample-cert-1.pdf',
          validation_code: 'CERT-001-2024',
          issued_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  // Generate certificate mutation
  const generateCertificateMutation = useMutation({
    mutationFn: async ({ courseId, userId }: { courseId: string; userId: string }) => {
      console.log('Simulando geração de certificado:', { courseId, userId });
      
      // Simulate certificate generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCertificate: Certificate = {
        id: Date.now().toString(),
        user_id: userId,
        course_id: courseId,
        certificate_url: `/certificates/cert-${courseId}-${userId}.pdf`,
        validation_code: `CERT-${courseId.slice(0, 3).toUpperCase()}-${Date.now()}`,
        issued_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      return newCertificate;
    },
    onSuccess: () => {
      toast.success('Certificado gerado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
    onError: (error) => {
      console.error('Erro ao gerar certificado:', error);
      toast.error('Erro ao gerar certificado');
    }
  });

  // Validate certificate mutation
  const validateCertificateMutation = useMutation({
    mutationFn: async (validationCode: string) => {
      console.log('Simulando validação de certificado:', validationCode);
      
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        valid: true,
        certificate: certificates.find(cert => cert.validation_code === validationCode)
      };
    },
    onError: (error) => {
      console.error('Erro ao validar certificado:', error);
      toast.error('Erro ao validar certificado');
    }
  });

  return {
    certificates,
    isLoading,
    error,
    generateCertificate: generateCertificateMutation.mutate,
    isGenerating: generateCertificateMutation.isPending,
    validateCertificate: validateCertificateMutation.mutate,
    isValidating: validateCertificateMutation.isPending
  };
};
