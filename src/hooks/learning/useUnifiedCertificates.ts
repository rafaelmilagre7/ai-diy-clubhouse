import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getCourseCapacitationDescription } from "@/utils/certificates/courseCapacitationUtils";

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
        // Certificados de cursos com dados completos incluindo lessons
        supabase
          .from('learning_certificates')
          .select(`
            *,
            learning_courses:course_id (
              title, 
              description, 
              cover_image_url,
              created_at,
              updated_at,
              learning_modules (
                id,
                title,
                learning_lessons (
                  id,
                  title,
                  estimated_time_minutes
                )
              )
            )
          `)
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false }),
        
        // Certificados de soluções com dados completos
        supabase
          .from('solution_certificates')
          .select(`
            *,
            solutions (
              title, 
              description, 
              thumbnail_url,
              category,
              difficulty,
              created_at
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
          ...filteredLearningCerts.map(cert => {
            const course = cert.learning_courses;
            // Extrair lições de todos os módulos
            const allLessons = course?.learning_modules?.flatMap(module => module.learning_lessons || []) || [];
            
            return {
              ...cert,
              type: 'course' as const,
              title: course?.title || 'Curso',
              description: course?.description,
              image_url: course?.cover_image_url,
              course_id: cert.course_id,
              completion_date: cert.completion_date || cert.issued_at,
              template_id: cert.template_id,
              metadata: {
                ...cert.metadata,
                totalModules: course?.learning_modules?.length || 0,
                totalLessons: allLessons.length,
                totalDuration: allLessons.reduce((acc: number, lesson: any) => acc + (lesson.estimated_time_minutes || 30), 0)
              }
            };
          }),
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
  
  // Download simplificado usando React component
  const downloadCertificate = async (certificateId: string) => {
    try {
      const certificate = certificates.find(c => c.id === certificateId);
      if (!certificate) {
        toast.error('Certificado não encontrado');
        return;
      }

      console.log('📥 [UNIFIED-DOWNLOAD] Iniciando download usando React component');
      
      // Importar componente React e PDF generator
      const { pdfGenerator } = await import('@/utils/certificates/pdfGenerator');
      const { PixelPerfectCertificateTemplate } = await import('@/components/certificates/PixelPerfectCertificateTemplate');
      const { createElement } = await import('react');
      const { createRoot } = await import('react-dom/client');
      
      // Dados para o certificado
      const certificateData = {
        userName: user?.user_metadata?.full_name || user?.email || "Usuário",
        solutionTitle: certificate.title,
        solutionCategory: getCourseCapacitationDescription({
          title: certificate.title,
          type: certificate.type,
          metadata: certificate.metadata
        }),
        implementationDate: formatDateForCertificate(
          certificate.completion_date || certificate.implementation_date || certificate.issued_at
        ),
        certificateId: certificate.id,
        validationCode: certificate.validation_code
      };

      // Criar elemento temporário off-screen
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        left: -10000px;
        top: 0;
        width: 1200px;
        height: 900px;
        pointer-events: none;
        z-index: -1;
      `;
      document.body.appendChild(tempContainer);

      // Renderizar o componente React
      const root = createRoot(tempContainer);
      
      let certificateElement: HTMLElement | null = null;
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout na renderização do certificado'));
        }, 10000);

        const handleReady = (element: HTMLElement) => {
          console.log('✅ [UNIFIED-DOWNLOAD] Certificado renderizado');
          certificateElement = element;
          clearTimeout(timeout);
          resolve();
        };

        const CertificateComponent = createElement(PixelPerfectCertificateTemplate, {
          data: certificateData,
          onReady: handleReady
        });

        root.render(CertificateComponent);
      });

      if (!certificateElement) {
        throw new Error('Falha ao renderizar certificado');
      }

      // Gerar PDF
      console.log('📄 [UNIFIED-DOWNLOAD] Gerando PDF...');
      const blob = await pdfGenerator.generateFromElement(certificateElement, certificateData);
      const filename = generateFilename(certificate.title, certificate.validation_code);
      
      await pdfGenerator.downloadPDF(blob, filename);
      toast.success('Certificado baixado com sucesso!');

      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);
      
    } catch (error: any) {
      console.error('❌ [UNIFIED-DOWNLOAD] Erro:', error);
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

  // Função auxiliar para gerar descrição automática
  const generateDescription = (certificate: UnifiedCertificate): string => {
    if (certificate.description) return certificate.description;
    
    if (certificate.type === 'course') {
      return `Certificado de conclusão do curso ${certificate.title}, demonstrando domínio das competências necessárias.`;
    } else {
      return `Certificado de implementação da solução ${certificate.title}, validando a aplicação prática dos conhecimentos.`;
    }
  };

  // Função auxiliar para calcular carga horária baseada no tipo e conteúdo real
  const generateWorkload = (certificate: UnifiedCertificate): string => {
    // Se tem dados específicos de duração total
    const totalDuration = certificate.metadata?.totalDuration;
    if (totalDuration) {
      const hours = Math.ceil(totalDuration / 60); // Converter minutos para horas
      return `${hours} horas`;
    }
    
    // Se tem dados específicos de lições
    const totalLessons = certificate.metadata?.totalLessons || 0;
    if (totalLessons > 0) {
      const estimatedHours = Math.ceil(totalLessons * 0.5); // 30min por lição
      return `${estimatedHours} horas`;
    }
    
    // Estimar baseado no tipo e título
    const title = certificate.title.toLowerCase();
    
    if (title.includes('formação') || title.includes('mastery')) {
      return '12+ horas';
    }
    
    if (certificate.type === 'course') {
      return '6-8 horas'; // Cursos tendem a ser mais longos
    } else {
      return '2-4 horas'; // Soluções são mais práticas
    }
  };

  // Função auxiliar para determinar dificuldade
  const generateDifficulty = (certificate: UnifiedCertificate): string => {
    const title = certificate.title.toLowerCase();
    
    if (title.includes('avançado') || title.includes('expert') || title.includes('mastery')) {
      return 'Avançado';
    }
    
    if (title.includes('intermediário') || title.includes('intermediate') || title.includes('plus')) {
      return 'Intermediário';
    }
    
    return 'Iniciante';
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