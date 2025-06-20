
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useSolutionCertificate = (solutionId: string) => {
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<any>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadCertificateData = async () => {
      if (!user?.id || !solutionId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Buscar certificado existente
        const { data: existingCert, error: certError } = await supabase
          .from('solution_certificates')
          .select('*')
          .eq('user_id', user.id as any)
          .eq('solution_id', solutionId as any)
          .single();

        if (certError && certError.code !== 'PGRST116') {
          console.error('Erro ao buscar certificado:', certError);
        } else if (existingCert) {
          setCertificate(existingCert);
          setIsEligible(true);
          setIsLoading(false);
          return;
        }

        // Verificar elegibilidade
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('*, solutions(*)')
          .eq('user_id', user.id as any)
          .eq('solution_id', solutionId as any)
          .single();

        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Erro ao verificar progresso:', progressError);
          setIsEligible(false);
        } else if (progressData && (progressData as any).is_completed) {
          setIsEligible(true);
        } else {
          setIsEligible(false);
        }

      } catch (error) {
        console.error('Erro ao carregar dados do certificado:', error);
        setIsEligible(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadCertificateData();
  }, [user?.id, solutionId]);

  const generateCertificate = async () => {
    if (!user?.id || !solutionId || isGenerating) return;

    try {
      setIsGenerating(true);

      // Verificar se já existe certificado
      const { data: existingCert } = await supabase
        .from('solution_certificates')
        .select('*')
        .eq('user_id', user.id as any)
        .eq('solution_id', solutionId as any)
        .single();

      if (existingCert) {
        toast.info('Você já possui um certificado para esta solução.');
        setCertificate(existingCert);
        return;
      }

      // Buscar dados do progresso para usar como data de implementação
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*, solutions(*)')
        .eq('user_id', user.id as any)
        .eq('solution_id', solutionId as any)
        .eq('is_completed', true as any)
        .single();

      if (progressError || !progressData) {
        toast.error('Você precisa completar a implementação antes de gerar o certificado.');
        return;
      }

      // Gerar código de validação
      const validationCode = generateValidationCode();
      const implementationDate = (progressData as any).completed_at || (progressData as any).created_at;

      // Criar certificado
      const { data: newCert, error: insertError } = await supabase
        .from('solution_certificates')
        .insert({
          user_id: user.id,
          solution_id: solutionId,
          implementation_date: implementationDate,
          validation_code: validationCode,
          issued_at: new Date().toISOString()
        } as any)
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar certificado:', insertError);
        toast.error('Erro ao gerar certificado. Tente novamente.');
        return;
      }

      setCertificate(newCert);
      toast.success('Certificado gerado com sucesso!');

    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      toast.error('Erro inesperado ao gerar certificado.');
    } finally {
      setIsGenerating(false);
    }
  };

  const checkEligibility = async () => {
    if (!user?.id || !solutionId) return false;

    try {
      const { data: progressData, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id as any)
        .eq('solution_id', solutionId as any)
        .eq('is_completed', true as any)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar elegibilidade:', error);
        return false;
      }

      return !!progressData;
    } catch (error) {
      console.error('Erro ao verificar elegibilidade:', error);
      return false;
    }
  };

  const generateNewCertificate = async () => {
    if (!user?.id || !solutionId) return;

    try {
      setIsGenerating(true);

      // Buscar dados do progresso
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*, solutions(*)')
        .eq('user_id', user.id as any)
        .eq('solution_id', solutionId as any)
        .eq('is_completed', true as any)
        .single();

      if (progressError || !progressData) {
        toast.error('Progresso não encontrado ou solução não completada.');
        return;
      }

      const validationCode = generateValidationCode();
      const implementationDate = (progressData as any).completed_at || (progressData as any).created_at;

      const { data: newCert, error: insertError } = await supabase
        .from('solution_certificates')
        .insert({
          user_id: user.id,
          solution_id: solutionId,
          implementation_date: implementationDate,
          validation_code: validationCode,
          issued_at: new Date().toISOString()
        } as any)
        .select('*, solutions(*)')
        .single();

      if (insertError) {
        console.error('Erro ao criar certificado:', insertError);
        toast.error('Erro ao gerar novo certificado.');
        return;
      }

      setCertificate(newCert);
      toast.success('Novo certificado gerado com sucesso!');

    } catch (error) {
      console.error('Erro ao gerar novo certificado:', error);
      toast.error('Erro inesperado.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = (certificate: any, userProfile: any) => {
    if (!certificate || !userProfile) {
      toast.error('Dados do certificado não disponíveis.');
      return;
    }

    try {
      // Criar um elemento temporário para download
      const element = document.createElement('a');
      const certificateText = `
CERTIFICADO DE IMPLEMENTAÇÃO

Este certificado atesta que ${userProfile.name || 'Usuário'} 
implementou com sucesso a solução: ${certificate.solutions?.title || 'Solução'}

Data de Implementação: ${new Date(certificate.implementation_date).toLocaleDateString('pt-BR')}
Código de Validação: ${certificate.validation_code}
Data de Emissão: ${new Date(certificate.issued_at).toLocaleDateString('pt-BR')}

VIVER DE IA Club
      `;

      const file = new Blob([certificateText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `certificado-${certificate.validation_code}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success('Certificado baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar certificado:', error);
      toast.error('Erro ao baixar certificado.');
    }
  };

  const openCertificateInNewTab = (certificate: any, userProfile: any) => {
    if (!certificate || !userProfile) {
      toast.error('Dados do certificado não disponíveis.');
      return;
    }

    try {
      const certificateContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificado de Implementação</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            .certificate { border: 3px solid #2563eb; padding: 40px; margin: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 20px; }
            .content { font-size: 16px; line-height: 1.6; }
            .signature { margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="title">CERTIFICADO DE IMPLEMENTAÇÃO</div>
            <div class="content">
              <p>Este certificado atesta que <strong>${userProfile.name || 'Usuário'}</strong></p>
              <p>implementou com sucesso a solução:</p>
              <p><strong>${certificate.solutions?.title || 'Solução'}</strong></p>
              <br>
              <p>Data de Implementação: ${new Date(certificate.implementation_date).toLocaleDateString('pt-BR')}</p>
              <p>Código de Validação: ${certificate.validation_code}</p>
              <p>Data de Emissão: ${new Date(certificate.issued_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <div class="signature">
              <p><strong>VIVER DE IA Club</strong></p>
            </div>
          </div>
        </body>
        </html>
      `;

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(certificateContent);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Erro ao abrir certificado:', error);
      toast.error('Erro ao abrir certificado.');
    }
  };

  const generateValidationCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  return {
    certificate,
    isEligible,
    isLoading,
    isGenerating,
    generateCertificate,
    checkEligibility,
    generateNewCertificate,
    downloadCertificate,
    openCertificateInNewTab
  };
};
