import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  template_id?: string;
  metadata?: Record<string, any>;
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
      // Buscar todos os certificados com dados das tabelas relacionadas
      const [learningCertsResult, solutionCertsResult] = await Promise.all([
        // Certificados de cursos
        supabase
          .from('learning_certificates')
          .select(`
            *,
            learning_courses:course_id (
              title, 
              description, 
              cover_image_url
            )
          `)
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false }),
        
        // Certificados de soluções
        supabase
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
          .order('issued_at', { ascending: false })
      ]);

      const { data: learningCerts, error: learningError } = learningCertsResult;
      const { data: solutionCerts, error: solutionError } = solutionCertsResult;
      
      if (learningError) throw learningError;
      if (solutionError) throw solutionError;

        // Filtrar por courseId se especificado
        const filteredLearningCerts = courseId 
          ? (learningCerts || []).filter(cert => cert.course_id === courseId)
          : learningCerts || [];

        // Unificar certificados com padronização de dados otimizada
        const allCertificates: UnifiedCertificate[] = [
          ...filteredLearningCerts.map(cert => ({
            ...cert,
            type: 'course' as const,
            title: cert.learning_courses?.title || 'Curso',
            description: cert.learning_courses?.description,
            image_url: cert.learning_courses?.cover_image_url,
            course_id: cert.course_id,
            completion_date: cert.completion_date || cert.issued_at,
            template_id: cert.template_id,
            metadata: cert.metadata || {}
          })),
          ...(solutionCerts || []).map(cert => ({
            ...cert,
            type: 'solution' as const,
            title: cert.solutions?.title || 'Solução',
            description: cert.solutions?.description,
            image_url: cert.solutions?.thumbnail_url,
            solution_id: cert.solution_id,
            completion_date: cert.completion_date || cert.implementation_date || cert.issued_at,
            template_id: cert.template_id,
            metadata: cert.metadata || {}
          }))
        ];
        
        // Ordenar por data de emissão (mais recente primeiro)
        allCertificates.sort((a, b) => 
          new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
        );
        
        console.log('✅ [UNIFIED_CERTIFICATES] Certificados unificados:', {
          total: allCertificates.length,
          courses: filteredLearningCerts.length,
          solutions: (solutionCerts || []).length
        });
        
        return allCertificates;
        
      } catch (error) {
        console.error("❌ [UNIFIED_CERTIFICATES] Erro ao buscar certificados:", error);
        throw error;
      }
    },
    enabled: !!user
  });
  
  // Gerar certificados pendentes - versão otimizada com tratamento de erro
  const generatePendingCertificates = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      
      console.log('🔄 Verificando certificados pendentes...');
      
      // Tentar função otimizada primeiro
      try {
        const { data, error } = await supabase.rpc('generate_pending_certificates_optimized');
        if (error) throw error;
        return data;
      } catch (optimizedError) {
        // Fallback para função original
        console.log('⚠️ Função otimizada não disponível, usando original...');
        const { data, error } = await supabase.rpc('generate_pending_certificates');
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      const totalGenerated = data.total_generated || 0;
      
      console.log('✅ Verificação de certificados concluída:', { totalGenerated });
      
      if (totalGenerated > 0) {
        toast.success(`${totalGenerated} certificado${totalGenerated > 1 ? 's' : ''} gerado${totalGenerated > 1 ? 's' : ''} com sucesso!`);
        
        // Exibir detalhes se disponíveis
        if (data.generated_courses?.length > 0) {
          data.generated_courses.forEach((cert: any) => {
            toast.success(`📚 Certificado de curso: ${cert.course_title}`);
          });
        }
        
        if (data.generated_solutions?.length > 0) {
          data.generated_solutions.forEach((cert: any) => {
            toast.success(`💡 Certificado de solução: ${cert.solution_title}`);
          });
        }
      } else {
        toast.info('✨ Você já possui todos os certificados disponíveis!');
      }
      
      // Invalidar cache para recarregar certificados
      queryClient.invalidateQueries({ queryKey: ['unified-certificates'] });
    },
    onError: (error: any) => {
      console.error("❌ Erro ao gerar certificados pendentes:", error);
      toast.error('Erro ao verificar certificados pendentes. Tente novamente.');
    }
  });
  
  // Download otimizado de certificado
  const downloadCertificate = async (certificateId: string) => {
    try {
      const certificate = certificates.find(c => c.id === certificateId);
      if (!certificate) {
        toast.error('Certificado não encontrado');
        return;
      }

      console.log('📥 Iniciando download do certificado:', certificateId);
      
      // Importar sistema unificado
      const { pdfGenerator } = await import('@/utils/certificates/pdfGenerator');
      const { templateEngine } = await import('@/utils/certificates/templateEngine');
      
        // Dados padronizados para certificado
        const certificateData = {
          userName: user?.user_metadata?.full_name || user?.email || "Usuário",
          solutionTitle: certificate.title,
          courseTitle: certificate.type === 'course' ? certificate.title : undefined,
          solutionCategory: certificate.type === 'solution' ? 'Solução de IA' : 'Curso',
          implementationDate: formatDateForCertificate(
            certificate.completion_date || certificate.implementation_date || certificate.issued_at
          ),
          completedDate: formatDateForCertificate(
            certificate.completion_date || certificate.issued_at
          ),
          certificateId: certificate.id,
          validationCode: certificate.validation_code
        };

      // Template com design aprovado
      const template = templateEngine.generateDefaultTemplate();
      const html = templateEngine.processTemplate(template, certificateData);
      const css = templateEngine.optimizeCSS(template.css_styles);

      // Renderização otimizada em elemento off-screen
      const offscreenElement = document.createElement('div');
      offscreenElement.style.cssText = `
        position: fixed;
        left: -10000px;
        top: 0;
        width: 1123px;
        height: 920px;
        pointer-events: none;
        z-index: -1;
      `;
      
      offscreenElement.innerHTML = `<style>${css}</style>${html}`;
      document.body.appendChild(offscreenElement);

      // Aguardar renderização e fontes
      await Promise.all([
        new Promise(resolve => setTimeout(resolve, 1000)),
        document.fonts?.ready || Promise.resolve()
      ]);

      const certificateElement = offscreenElement.querySelector('.certificate-container') as HTMLElement;
      if (!certificateElement) {
        throw new Error('Elemento do certificado não encontrado');
      }

      // Gerar PDF
      const blob = await pdfGenerator.generateFromElement(certificateElement, certificateData);
      const filename = generateFilename(certificate.title, certificate.validation_code);
      
      await pdfGenerator.downloadPDF(blob, filename);
      toast.success('Certificado baixado com sucesso!');

      // Cleanup
      document.body.removeChild(offscreenElement);
      
    } catch (error: any) {
      console.error('❌ Erro ao fazer download:', error);
      toast.error('Erro ao fazer download do certificado');
    }
  };

  // Função utilitária para formatar data para certificado
  const formatDateForCertificate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  // Função utilitária para gerar nome limpo do arquivo
  const generateFilename = (title: string, validationCode: string): string => {
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 50); // Limitar tamanho
    return `certificado-${cleanTitle}-${validationCode}.pdf`;
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