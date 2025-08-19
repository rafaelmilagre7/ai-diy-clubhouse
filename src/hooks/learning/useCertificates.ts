
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Certificate } from "@/types/learningTypes";

export const useCertificates = (courseId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Buscar certificados do usuário (cursos e soluções)
  const { 
    data: certificates = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['all-certificates', user?.id, courseId],
    queryFn: async () => {
      if (!user) {
        console.log('🔍 [CERTIFICATES] Usuário não autenticado');
        return [];
      }
      
      console.log('🔍 [CERTIFICATES] Buscando certificados para usuário:', user.id, user.email);
      
      try {
        // Buscar certificados de cursos
        let learningQuery = supabase
          .from('learning_certificates')
          .select(`
            *,
            learning_courses:course_id (title, description, cover_image_url)
          `);
          
        if (courseId) {
          learningQuery = learningQuery.eq('course_id', courseId);
        }
        
        const { data: learningCerts, error: learningError } = await learningQuery.eq('user_id', user.id);
        
        if (learningError) {
          console.error('❌ [CERTIFICATES] Erro ao buscar certificados de cursos:', learningError);
          throw learningError;
        }

        console.log('📚 [CERTIFICATES] Certificados de cursos encontrados:', learningCerts?.length || 0);

        // Buscar certificados de soluções
        const { data: solutionCerts, error: solutionError } = await supabase
          .from('solution_certificates')
          .select(`
            *,
            solutions (title, description, thumbnail_url)
          `)
          .eq('user_id', user.id);
        
        if (solutionError) {
          console.error('❌ [CERTIFICATES] Erro ao buscar certificados de soluções:', solutionError);
          throw solutionError;
        }

        console.log('💡 [CERTIFICATES] Certificados de soluções encontrados:', solutionCerts?.length || 0);

        // Unificar os certificados com tipo identificador
        const allCertificates = [
          ...(learningCerts || []).map(cert => ({
            ...cert,
            type: 'course' as const,
            title: cert.learning_courses?.title,
            description: cert.learning_courses?.description,
            image_url: cert.learning_courses?.cover_image_url
          })),
          ...(solutionCerts || []).map(cert => ({
            ...cert,
            type: 'solution' as const,
            title: cert.solutions?.title,
            description: cert.solutions?.description,
            image_url: cert.solutions?.thumbnail_url
          }))
        ];
        
        console.log('✅ [CERTIFICATES] Total de certificados unificados:', allCertificates.length);
        
        return allCertificates;
      } catch (error) {
        console.error("❌ [CERTIFICATES] Erro geral ao buscar certificados:", error);
        return [];
      }
    },
    enabled: !!user
  });
  
  // Verificar elegibilidade para certificado
  const checkEligibility = async (courseId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    try {
      // Verificar se o usuário completou todas as aulas do curso
      const { data: lessons, error: lessonsError } = await supabase
        .from('learning_lessons')
        .select(`
          id,
          learning_modules!inner (
            course_id
          )
        `)
        .eq('learning_modules.course_id', courseId)
        .eq('published', true);
      
      if (lessonsError) throw lessonsError;
      
      if (!lessons || lessons.length === 0) return false;
      
      // Verificar se todas as aulas foram completadas
      const { data: progress, error: progressError } = await supabase
        .from('learning_progress')
        .select('lesson_id, progress_percentage, completed_at')
        .eq('user_id', user.id)
        .in('lesson_id', lessons.map(l => l.id))
        .eq('progress_percentage', 100)
        .not('completed_at', 'is', null);
      
      if (progressError) throw progressError;
      
      return progress && progress.length === lessons.length;
    } catch (error: any) {
      console.error("Erro ao verificar elegibilidade:", error);
      return false;
    }
  };
  
  // Gerar certificado usando função SQL
  const generateCertificate = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase.rpc('create_learning_certificate_if_eligible', {
        p_user_id: user.id,
        p_course_id: courseId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Certificado gerado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['learning-certificates', user?.id] });
    },
    onError: (error: any) => {
      console.error("Erro ao gerar certificado:", error);
      if (error.message.includes('já possui certificado')) {
        toast.info('Você já possui um certificado para este curso.');
      } else if (error.message.includes('não completou')) {
        toast.error('Você precisa completar todas as aulas do curso para gerar o certificado.');
      } else {
        toast.error('Erro ao gerar certificado. Tente novamente.');
      }
    }
  });
  
  // Baixar certificado
  const downloadCertificate = async (certificateId: string) => {
    try {
      const certificate = certificates.find(c => c.id === certificateId);
      if (!certificate) {
        toast.error('Certificado não encontrado');
        return;
      }

      // Gerar PDF do certificado (implementação simplificada)
      await generateCertificatePDF(certificate);
    } catch (error: any) {
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

// Função melhorada para gerar PDF do certificado usando o novo sistema unificado
const generateCertificatePDF = async (certificate: any) => {
  try {
    const { useAuth } = await import('@/contexts/auth');
    const { templateEngine } = await import('@/utils/certificates/templateEngine');
    const { pdfGenerator } = await import('@/utils/certificates/pdfGenerator');
    
    // Buscar dados do usuário
    const user = useAuth().user;
    const userName = user?.user_metadata?.full_name || user?.email || "Usuário";
    
    const courseName = certificate.title || certificate.learning_courses?.title || certificate.solutions?.title || "Curso";
    const issueDate = new Date(certificate.issued_at).toLocaleDateString('pt-BR');
    const validationCode = certificate.validation_code;
    const certificateType = certificate.type === 'solution' ? 'Solução de IA' : 'Curso';

    // Usar o novo sistema unificado
    const template = templateEngine.generateDefaultTemplate();
    const certificateData = {
      userName,
      solutionTitle: courseName,
      solutionCategory: certificateType,
      implementationDate: issueDate,
      certificateId: certificate.id,
      validationCode: validationCode
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
      const filename = `certificado-${courseName.replace(/[^a-zA-Z0-9]/g, '-')}-${validationCode}.pdf`;
      await pdfGenerator.downloadPDF(blob, filename);
    }

    document.body.removeChild(tempDiv);
    toast.success('Certificado baixado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error('Erro ao gerar PDF do certificado');
  }
};
