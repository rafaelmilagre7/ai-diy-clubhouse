import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export interface UnifiedCertificate {
  id: string;
  user_id: string;
  validation_code: string;
  issued_at: string;
  type: 'course' | 'solution';
  title: string;
  description?: string;
  image_url?: string;
  course_id?: string;
  solution_id?: string;
  implementation_date?: string;
  completion_date?: string;
  learning_courses?: {
    title: string;
    description?: string;
    cover_image_url?: string;
  };
  solutions?: {
    title: string;
    description?: string;
    thumbnail_url?: string;
  };
}

export const useUnifiedCertificates = (courseId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Buscar todos os certificados do usuário
  const { 
    data: certificates = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['unified-certificates', user?.id, courseId],
    queryFn: async (): Promise<UnifiedCertificate[]> => {
      if (!user) return [];
      
      console.log('🔍 [UNIFIED_CERTIFICATES] Buscando certificados para usuário:', user.id);
      
      try {
        // Buscar certificados de cursos
        let learningQuery = supabase
          .from('learning_certificates')
          .select(`
            *,
            learning_courses:course_id (
              title, 
              description, 
              cover_image_url
            )
          `);
          
        if (courseId) {
          learningQuery = learningQuery.eq('course_id', courseId);
        }
        
        const { data: learningCerts, error: learningError } = await learningQuery
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false });
        
        if (learningError) throw learningError;

        // Buscar certificados de soluções
        const { data: solutionCerts, error: solutionError } = await supabase
          .from('solution_certificates')
          .select(`
            *,
            solutions (
              title, 
              description, 
              thumbnail_url
            )
          `)
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false });
        
        if (solutionError) throw solutionError;

        // Unificar certificados
        const allCertificates: UnifiedCertificate[] = [
          ...(learningCerts || []).map(cert => ({
            ...cert,
            type: 'course' as const,
            title: cert.learning_courses?.title || 'Curso',
            description: cert.learning_courses?.description,
            image_url: cert.learning_courses?.cover_image_url,
            course_id: cert.course_id
          })),
          ...(solutionCerts || []).map(cert => ({
            ...cert,
            type: 'solution' as const,
            title: cert.solutions?.title || 'Solução',
            description: cert.solutions?.description,
            image_url: cert.solutions?.thumbnail_url,
            solution_id: cert.solution_id
          }))
        ];
        
        // Ordenar por data de emissão (mais recente primeiro)
        allCertificates.sort((a, b) => 
          new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
        );
        
        console.log('✅ [UNIFIED_CERTIFICATES] Certificados carregados:', allCertificates.length);
        return allCertificates;
        
      } catch (error) {
        console.error("❌ [UNIFIED_CERTIFICATES] Erro ao buscar certificados:", error);
        throw error;
      }
    },
    enabled: !!user
  });
  
  // Gerar certificados pendentes
  const generatePendingCertificates = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase.rpc('generate_pending_certificates');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const totalGenerated = data.total_generated || 0;
      
      if (totalGenerated > 0) {
        toast.success(`${totalGenerated} certificado${totalGenerated > 1 ? 's' : ''} gerado${totalGenerated > 1 ? 's' : ''} com sucesso!`);
        
        // Exibir detalhes dos certificados gerados
        if (data.generated_courses?.length > 0) {
          data.generated_courses.forEach((cert: any) => {
            toast.success(`Certificado de curso gerado: ${cert.course_title}`);
          });
        }
        
        if (data.generated_solutions?.length > 0) {
          data.generated_solutions.forEach((cert: any) => {
            toast.success(`Certificado de solução gerado: ${cert.solution_title}`);
          });
        }
      } else {
        toast.info('Nenhum certificado novo foi gerado. Você já possui todos os certificados disponíveis.');
      }
      
      // Invalidar cache para recarregar certificados
      queryClient.invalidateQueries({ queryKey: ['unified-certificates'] });
    },
    onError: (error: any) => {
      console.error("Erro ao gerar certificados pendentes:", error);
      toast.error('Erro ao gerar certificados. Tente novamente.');
    }
  });
  
  // Download de certificado usando o novo sistema
  const downloadCertificate = async (certificateId: string) => {
    try {
      const certificate = certificates.find(c => c.id === certificateId);
      if (!certificate) {
        toast.error('Certificado não encontrado');
        return;
      }

      // Usar o novo sistema de PDF
      const { pdfGenerator } = await import('@/utils/certificates/pdfGenerator');
      const { templateEngine } = await import('@/utils/certificates/templateEngine');
      
      const template = templateEngine.generateDefaultTemplate();
      const certificateData = {
        userName: user?.user_metadata?.full_name || user?.email || "Usuário",
        solutionTitle: certificate.title,
        solutionCategory: certificate.type === 'solution' ? 'Solução de IA' : 'Curso',
        implementationDate: certificate.implementation_date || certificate.completion_date || certificate.issued_at,
        certificateId: certificate.id,
        validationCode: certificate.validation_code
      };

      // Processar template
      const html = templateEngine.processTemplate(template, certificateData);
      const css = templateEngine.optimizeCSS(template.css_styles);

      // Criar elemento temporário
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `<style>${css}</style>${html}`;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 500));

      const certificateElement = tempDiv.querySelector('.certificate-container') as HTMLElement;
      if (certificateElement) {
        const blob = await pdfGenerator.generateFromElement(certificateElement, certificateData);
        const filename = `certificado-${certificate.title.replace(/[^a-zA-Z0-9]/g, '-')}-${certificate.validation_code}.pdf`;
        await pdfGenerator.downloadPDF(blob, filename);
        toast.success('Certificado baixado com sucesso!');
      }

      document.body.removeChild(tempDiv);
    } catch (error: any) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download do certificado');
    }
  };

  return { 
    certificates, 
    isLoading, 
    error, 
    downloadCertificate,
    generatePendingCertificates: generatePendingCertificates.mutate,
    isGeneratingPending: generatePendingCertificates.isPending
  };
};