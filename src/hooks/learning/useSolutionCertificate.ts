
import { useState } from 'react';
import { toast } from 'sonner';

export interface SolutionCertificate {
  id: string;
  user_id: string;
  solution_id: string;
  certificate_url: string;
  validation_code: string;
  issued_at: string;
  created_at: string;
}

export const useSolutionCertificate = (solutionId: string) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCertificate = async (userId: string): Promise<SolutionCertificate | null> => {
    if (!solutionId || !userId) return null;

    setIsGenerating(true);
    
    try {
      console.log('Simulando geração de certificado de solução:', { solutionId, userId });
      
      // Simulate certificate generation since table doesn't exist
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const certificate: SolutionCertificate = {
        id: Date.now().toString(),
        user_id: userId,
        solution_id: solutionId,
        certificate_url: `/certificates/solution-${solutionId}-${userId}.pdf`,
        validation_code: `SOL-${solutionId.slice(0, 3).toUpperCase()}-${Date.now()}`,
        issued_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      toast.success('Certificado de solução gerado com sucesso!');
      return certificate;
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      toast.error('Erro ao gerar certificado');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const getCertificate = async (userId: string): Promise<SolutionCertificate | null> => {
    console.log('Simulando busca de certificado:', { solutionId, userId });
    
    // Mock - return null (no certificate exists)
    return null;
  };

  return {
    generateCertificate,
    getCertificate,
    isGenerating
  };
};
