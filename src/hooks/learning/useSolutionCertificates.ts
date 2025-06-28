
import { useState } from 'react';
import { toast } from 'sonner';

export interface SolutionCertificate {
  id: string;
  user_id: string;
  solution_id: string;
  implementation_date: string;
  certificate_url: string | null;
  validation_code: string;
  template_id: string | null;
  issued_at: string;
  created_at: string;
  updated_at: string;
}

export const useSolutionCertificates = (solutionId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const checkEligibility = async (userId: string): Promise<boolean> => {
    console.log('Simulando verificação de elegibilidade:', { solutionId, userId });
    await new Promise(resolve => setTimeout(resolve, 500));
    return true; // Mock - always eligible
  };

  const generateCertificate = async (userId: string, implementationDate: string): Promise<SolutionCertificate | null> => {
    setIsLoading(true);
    try {
      console.log('Simulando geração de certificado de solução:', { solutionId, userId, implementationDate });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const certificate: SolutionCertificate = {
        id: Date.now().toString(),
        user_id: userId,
        solution_id: solutionId,
        implementation_date: implementationDate,
        certificate_url: `/certificates/solution-${solutionId}-${userId}.pdf`,
        validation_code: `SOL-${solutionId.slice(0, 3).toUpperCase()}-${Date.now()}`,
        template_id: null,
        issued_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      toast.success('Certificado de solução gerado com sucesso!');
      return certificate;
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      toast.error('Erro ao gerar certificado');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getCertificate = async (userId: string): Promise<SolutionCertificate | null> => {
    console.log('Simulando busca de certificado:', { solutionId, userId });
    return null; // Mock - no certificate exists
  };

  const getTemplates = async () => {
    console.log('Simulando busca de templates de certificado');
    return [
      {
        id: '1',
        name: 'Template Padrão',
        description: 'Template padrão para certificados de solução',
        is_default: true
      }
    ];
  };

  return {
    checkEligibility,
    generateCertificate,
    getCertificate,
    getTemplates,
    isLoading
  };
};
