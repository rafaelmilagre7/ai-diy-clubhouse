
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Certificate } from "@/types/learningTypes";

export const useCertificates = (courseId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  console.log('[useCertificates] Hook iniciado', {
    userId: user?.id,
    courseId,
    hasUser: !!user
  });

  // Buscar certificados do usuário
  const { data: certificates = [], isLoading, error } = useQuery({
    queryKey: ['certificates', user?.id, courseId],
    queryFn: async () => {
      console.log('[useCertificates] Executando query para buscar certificados');
      
      if (!user?.id) {
        console.log('[useCertificates] Usuário não autenticado, retornando array vazio');
        return [];
      }
      
      try {
        let query = supabase
          .from('learning_certificates')
          .select(`
            *,
            learning_courses (
              id,
              title,
              description
            )
          `)
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false });

        if (courseId) {
          query = query.eq('course_id', courseId);
        }

        console.log('[useCertificates] Executando query no Supabase...');
        const { data, error } = await query;
        
        if (error) {
          console.error('[useCertificates] Erro na query:', error);
          throw error;
        }
        
        console.log('[useCertificates] Certificados encontrados:', data?.length || 0);
        return data as Certificate[];
      } catch (error) {
        console.error('[useCertificates] Erro ao buscar certificados:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: 1000
  });

  // Verificar elegibilidade para certificado
  const checkEligibility = async (courseId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      console.log('[useCertificates] Verificando elegibilidade para curso:', courseId);
      
      // Verificar se o usuário completou o curso
      const { data: progress, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('is_completed', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[useCertificates] Erro ao verificar progresso:', error);
        return false;
      }

      const isEligible = !!progress;
      console.log('[useCertificates] Elegibilidade:', isEligible);
      return isEligible;
    } catch (error) {
      console.error('[useCertificates] Erro ao verificar elegibilidade:', error);
      return false;
    }
  };

  // Gerar certificado
  const generateCertificate = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      console.log('[useCertificates] Gerando certificado para curso:', courseId);

      // Verificar elegibilidade primeiro
      const isEligible = await checkEligibility(courseId);
      if (!isEligible) {
        throw new Error('Você precisa completar o curso para gerar o certificado.');
      }

      // Verificar se já existe certificado
      const { data: existingCert } = await supabase
        .from('learning_certificates')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (existingCert) {
        throw new Error('Você já possui um certificado para este curso.');
      }

      // Gerar código de validação
      const validationCode = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Criar certificado
      const { data, error } = await supabase
        .from('learning_certificates')
        .insert({
          user_id: user.id,
          course_id: courseId,
          validation_code: validationCode,
          issued_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('[useCertificates] Certificado gerado com sucesso:', data.id);
      return data;
    },
    onSuccess: () => {
      toast.success('Certificado gerado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
    onError: (error: any) => {
      console.error('[useCertificates] Erro ao gerar certificado:', error);
      toast.error(error.message || 'Erro ao gerar certificado. Tente novamente.');
    }
  });

  // Download do certificado
  const downloadCertificate = async (certificateId: string) => {
    try {
      console.log('[useCertificates] Fazendo download do certificado:', certificateId);
      
      const certificate = certificates.find(c => c.id === certificateId);
      if (!certificate) {
        toast.error('Certificado não encontrado');
        return;
      }

      // Gerar PDF do certificado (implementação simplificada)
      await generateCertificatePDF(certificate);
    } catch (error) {
      console.error('[useCertificates] Erro ao fazer download:', error);
      toast.error('Erro ao fazer download do certificado');
    }
  };

  console.log('[useCertificates] Estado atual:', {
    certificatesCount: certificates.length,
    isLoading,
    hasError: !!error
  });

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
const generateCertificatePDF = async (certificate: Certificate) => {
  try {
    console.log('[useCertificates] Gerando PDF para certificado:', certificate.id);
    
    // Implementação simplificada - criar um documento básico
    const doc = document.createElement('div');
    doc.style.cssText = `
      width: 800px;
      height: 600px;
      padding: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
      position: absolute;
      left: -9999px;
    `;
    
    const course = (certificate as any).learning_courses;
    
    doc.innerHTML = `
      <div style="margin-top: 100px;">
        <h1 style="font-size: 48px; margin-bottom: 30px;">CERTIFICADO</h1>
        <h2 style="font-size: 24px; margin-bottom: 20px;">DE CONCLUSÃO</h2>
        <p style="font-size: 18px; margin-bottom: 40px;">
          Certificamos que você completou com sucesso o curso
        </p>
        <h3 style="font-size: 32px; margin-bottom: 40px; color: #FFD700;">
          ${course?.title || 'Curso'}
        </h3>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Emitido em: ${new Date(certificate.issued_at).toLocaleDateString('pt-BR')}
        </p>
        <p style="font-size: 14px;">
          Código de validação: ${certificate.validation_code}
        </p>
      </div>
    `;
    
    document.body.appendChild(doc);
    
    // Usar html2canvas se estiver disponível
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(doc);
      
      // Converter para PDF usando jsPDF
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF('landscape');
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      
      pdf.save(`certificado-${course?.title || 'curso'}-${certificate.validation_code}.pdf`);
      
      toast.success('Certificado baixado com sucesso!');
    } catch (error) {
      console.error('[useCertificates] Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      document.body.removeChild(doc);
    }
  } catch (error) {
    console.error('[useCertificates] Erro na geração do PDF:', error);
    toast.error('Erro ao gerar certificado');
  }
};
