import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getCourseCapacitationDescription } from "@/utils/certificates/courseCapacitationUtils";
import { calculateCourseDuration, formatDurationForCertificate } from "@/utils/courseDurationCalculator";

export interface UnifiedCertificate {
  id: string;
  user_id: string;
  validation_code: string;
  issued_at: string;
  type: 'course' | 'solution';
  title: string;
  description?: string;
  customDescription?: string; // Descrição personalizada dos templates
  image_url?: string;
  course_id?: string;
  solution_id?: string;
  implementation_date?: string;
  completion_date?: string;
  template_id?: string;
  metadata?: Record<string, any>;
  workloadHours?: string; // Nova propriedade para duração real
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
      // Buscar durações reais dos cursos da nova tabela
      const { data: courseDurations } = await supabase
        .from('course_durations')
        .select('course_id, calculated_hours, total_duration_seconds, sync_status');
      
      // Criar mapa de durações por curso
      const durationMap = new Map();
      if (courseDurations) {
        courseDurations.forEach(duration => {
          durationMap.set(duration.course_id, {
            calculatedHours: duration.calculated_hours,
            totalDurationSeconds: duration.total_duration_seconds,
            syncStatus: duration.sync_status
          });
        });
      }
      
      // Buscar todos os certificados com dados das tabelas relacionadas
      const [learningCertsResult, solutionCertsResult] = await Promise.all([
        // Certificados de cursos com dados completos incluindo lessons e vídeos
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
                  estimated_time_minutes,
                  learning_lesson_videos (
                    id,
                    duration_seconds
                  )
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
        const allCertificates: UnifiedCertificate[] = [];
        
        // Processar certificados de cursos
        for (const cert of filteredLearningCerts) {
          const course = cert.learning_courses;
          // Extrair lições de todos os módulos
          const allLessons = course?.learning_modules?.flatMap(module => module.learning_lessons || []) || [];
          
          // Calcular duração real dos vídeos e contagem total
          let totalVideoDuration = 0;
          let totalVideoCount = 0;
          let videosWithDuration = 0;
          
          allLessons.forEach(lesson => {
            lesson.learning_lesson_videos?.forEach(video => {
              totalVideoCount++; // Contar todos os vídeos
              if (video.duration_seconds && video.duration_seconds > 0) {
                totalVideoDuration += video.duration_seconds;
                videosWithDuration++;
              }
            });
          });
          
          // Buscar descrição personalizada
          let customDescription = '';
          try {
            customDescription = await getCustomCertificateDescription({
              ...cert,
              type: 'course' as const,
              title: course?.title || 'Curso',
              metadata: {
                ...cert.metadata,
                totalModules: course?.learning_modules?.length || 0,
                totalLessons: allLessons.length,
                totalDuration: allLessons.reduce((acc: number, lesson: any) => acc + (lesson.estimated_time_minutes || 30), 0),
                realVideoDuration: totalVideoDuration,
                totalVideoCount: totalVideoCount,
                videosWithDuration: videosWithDuration,
                videoCount: totalVideoCount
              }
            });
          } catch (error) {
            console.error('Erro ao buscar descrição personalizada:', error);
            customDescription = getCourseCapacitationDescription({
              title: course?.title || 'Curso',
              type: 'course',
              metadata: cert.metadata
            });
          }
          
          allCertificates.push({
            ...cert,
            type: 'course' as const,
            title: course?.title || 'Curso',
            description: course?.description,
            customDescription,
            image_url: course?.cover_image_url,
            course_id: cert.course_id,
            completion_date: cert.completion_date || cert.issued_at,
            template_id: cert.template_id,
            // Usar duração real da nova tabela course_durations
            workloadHours: (() => {
              const courseDuration = durationMap.get(cert.course_id);
              if (courseDuration && courseDuration.syncStatus === 'completed') {
                console.log('✅ [WORKLOAD] Usando duração REAL sincronizada:', {
                  courseId: cert.course_id,
                  calculatedHours: courseDuration.calculatedHours
                });
                return courseDuration.calculatedHours;
              }
              
              // Fallback para duração estimada se não sincronizado
              if (totalVideoDuration > 0) {
                const hours = Math.floor(totalVideoDuration / 3600);
                const minutes = Math.floor((totalVideoDuration % 3600) / 60);
                let duration = '';
                if (hours > 0 && minutes > 0) {
                  duration = `${hours}h ${minutes}min`;
                } else if (hours > 0) {
                  duration = `${hours}h`;
                } else if (minutes > 0) {
                  duration = `${minutes}min`;
                } else {
                  duration = '0min';
                }
                console.log('⚠️ [WORKLOAD] Usando cálculo de fallback:', duration);
                return duration;
              }
              
              // Estimativa padrão se não há dados
              const estimatedHours = Math.max(1, Math.ceil(allLessons.length * 0.5));
              return `~${estimatedHours}h`;
            })(),
            metadata: {
              ...cert.metadata,
              totalModules: course?.learning_modules?.length || 0,
              totalLessons: allLessons.length,
              totalDuration: allLessons.reduce((acc: number, lesson: any) => acc + (lesson.estimated_time_minutes || 30), 0),
              realVideoDuration: totalVideoDuration, // Nova propriedade com duração real
              totalVideoCount: totalVideoCount, // Total de vídeos (incluindo sem duração)
              videosWithDuration: videosWithDuration, // Vídeos que têm duração
              videoCount: totalVideoCount // Alias para compatibilidade
            }
          });
        }
        
        // Processar certificados de soluções
        for (const cert of solutionCerts || []) {
          // Buscar descrição personalizada para soluções
          let customDescription = '';
          try {
            customDescription = await getCustomCertificateDescription({
              ...cert,
              type: 'solution' as const,
              title: cert.solutions?.title || 'Solução',
              metadata: cert.metadata || {}
            });
          } catch (error) {
            console.error('Erro ao buscar descrição personalizada para solução:', error);
            customDescription = getCourseCapacitationDescription({
              title: cert.solutions?.title || 'Solução',
              type: 'solution',
              metadata: cert.metadata
            });
          }
          
          allCertificates.push({
            ...cert,
            type: 'solution' as const,
            title: cert.solutions?.title || 'Solução',
            description: cert.solutions?.description,
            customDescription,
            image_url: cert.solutions?.thumbnail_url,
            solution_id: cert.solution_id,
            completion_date: cert.completion_date || cert.implementation_date || cert.issued_at,
            template_id: cert.template_id,
            metadata: cert.metadata || {}
          });
        }
        
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
  
  // Função auxiliar para buscar descrição personalizada do certificado
  const getCustomCertificateDescription = async (certificate: UnifiedCertificate): Promise<string> => {
    console.log('🔍 [DEBUG] getCustomCertificateDescription iniciada para:', {
      course_id: certificate.course_id,
      title: certificate.title,
      type: certificate.type,
      hasMetadata: !!certificate.metadata
    });

    // PRIORIDADE 1: Buscar descrição personalizada do template configurado no LMS
    if (certificate.course_id) {
      console.log('✅ [DEBUG] Buscando template personalizado para course_id:', certificate.course_id);
      const { getCourseCapacitationDescriptionFromTemplate } = await import('@/utils/certificates/courseCapacitationUtils');
      const result = await getCourseCapacitationDescriptionFromTemplate(certificate.course_id, {
        title: certificate.title,
        type: certificate.type,
        metadata: certificate.metadata
      });
      console.log('🎯 [DEBUG] Resultado da descrição personalizada:', result);
      return result;
    }
    
    console.log('⚠️ [DEBUG] Sem course_id, usando descrição genérica para:', {
      title: certificate.title,
      type: certificate.type
    });
    
    // PRIORIDADE 2: Fallback para descrição automática
    const fallbackResult = getCourseCapacitationDescription({
      title: certificate.title,
      type: certificate.type,
      metadata: certificate.metadata
    });
    console.log('📝 [DEBUG] Resultado da descrição genérica:', fallbackResult);
    return fallbackResult;
  };

  // Download simplificado usando React component
  const downloadCertificate = async (certificateId: string) => {
    try {
      const certificate = certificates.find(c => c.id === certificateId);
      if (!certificate) {
        toast.error('Certificado não encontrado');
        return;
      }

      // Buscar durações reais para o download
      const { data: courseDurations } = await supabase
        .from('course_durations')
        .select('course_id, calculated_hours, total_duration_seconds, sync_status');
      
      // Criar mapa de durações por curso
      const durationMap = new Map();
      if (courseDurations) {
        courseDurations.forEach(duration => {
          durationMap.set(duration.course_id, {
            calculatedHours: duration.calculated_hours,
            totalDurationSeconds: duration.total_duration_seconds,
            syncStatus: duration.sync_status
          });
        });
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
        solutionCategory: certificate.customDescription || await getCustomCertificateDescription(certificate),
        implementationDate: formatDateForCertificate(
          certificate.completion_date || certificate.implementation_date || certificate.issued_at
        ),
        certificateId: certificate.id,
        validationCode: certificate.validation_code,
        // Usar duração configurada no template LMS ou fallback para cálculo real
        workloadHours: await generateWorkload(certificate, durationMap),
        durationSeconds: certificate.metadata?.realVideoDuration || 0
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

  // Função auxiliar para buscar carga horária do template configurado no LMS
  const getTemplateWorkload = async (courseId: string): Promise<string | null> => {
    try {
      // Primeiro, buscar template específico do curso (sem filtro is_default)
      const { data: courseTemplate, error: courseError } = await supabase
        .from('learning_certificate_templates')
        .select('metadata')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .limit(1);
      
      if (!courseError && courseTemplate && courseTemplate.length > 0 && courseTemplate[0].metadata?.workload_hours) {
        console.log('✅ [WORKLOAD] Usando carga horária do template específico:', courseTemplate[0].metadata.workload_hours);
        return courseTemplate[0].metadata.workload_hours;
      }

      // Se não encontrou template específico, buscar template global padrão
      const { data: defaultTemplate, error: defaultError } = await supabase
        .from('learning_certificate_templates')
        .select('metadata')
        .eq('is_active', true)
        .eq('is_default', true)
        .is('course_id', null)
        .limit(1);

      if (!defaultError && defaultTemplate && defaultTemplate.length > 0 && defaultTemplate[0].metadata?.workload_hours) {
        console.log('✅ [WORKLOAD] Usando carga horária do template global padrão:', defaultTemplate[0].metadata.workload_hours);
        return defaultTemplate[0].metadata.workload_hours;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar workload do template:', error);
      return null;
    }
  };

  // Função auxiliar para calcular carga horária baseada no template do certificado
  const generateWorkload = async (certificate: UnifiedCertificate, durationMap: Map<string, any>): Promise<string> => {
    // PRIORIDADE 1: Buscar dados do template de certificado configurado no LMS
    if (certificate.course_id) {
      // Buscar template específico do curso configurado pelos admins
      const templateWorkload = await getTemplateWorkload(certificate.course_id);
      if (templateWorkload) {
        console.log('✅ [WORKLOAD] Usando duração do template LMS:', templateWorkload);
        return templateWorkload;
      }
    }
    
    // PRIORIDADE 2: Se tem dados específicos de duração total real dos vídeos
    const realVideoDuration = certificate.metadata?.realVideoDuration;
    const videoCount = certificate.metadata?.videoCount || 0;
    
    if (realVideoDuration && realVideoDuration > 0) {
      return formatDurationForCertificate(realVideoDuration, videoCount);
    }
    
    // Se tem dados específicos de duração total estimada
    const totalDuration = certificate.metadata?.totalDuration;
    if (totalDuration) {
      const hours = Math.ceil(totalDuration / 60); // Converter minutos para horas
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    }
    
    // Se tem apenas contagem de vídeos, usar estimativa
    if (videoCount > 0) {
      return formatDurationForCertificate(0, videoCount);
    }
    
    // Se tem dados específicos de lições
    const totalLessons = certificate.metadata?.totalLessons || 0;
    if (totalLessons > 0) {
      const estimatedHours = Math.ceil(totalLessons * 0.5); // 30min por lição
      return `${estimatedHours} hora${estimatedHours > 1 ? 's' : ''}`;
    }
    
    // Estimar baseado no tipo e título
    const title = certificate.title.toLowerCase();
    
    if (title.includes('formação') || title.includes('mastery')) {
      return '12+ horas';
    }
    
    if (certificate.type === 'course') {
      // Usar duração da tabela course_durations se disponível
      const courseDuration = durationMap.get(certificate.course_id);
      if (courseDuration && courseDuration.syncStatus === 'completed' && courseDuration.calculatedHours !== '0 horas') {
        return courseDuration.calculatedHours;
      } else {
        return '6-8 horas'; // Cursos tendem a ser mais longos
      }
    } else {
      // Para soluções, usar duração da tabela course_durations se disponível
      const courseDuration = durationMap.get(certificate.course_id);
      if (courseDuration && courseDuration.syncStatus === 'completed' && courseDuration.calculatedHours !== '0 horas') {
        return courseDuration.calculatedHours;
      } else {
        return '2-4 horas'; // Soluções são mais práticas
      }
    }
  };

  // Nova função específica para gerar workload com duração real
  const generateWorkloadFromRealDuration = (certificate: UnifiedCertificate, durationMap?: Map<string, any>): string => {
    const realVideoDuration = certificate.metadata?.realVideoDuration;
    const totalVideoCount = certificate.metadata?.totalVideoCount || certificate.metadata?.videoCount || 0;
    
    console.log('🔍 [WORKLOAD] Gerando workload para certificado:', {
      certificateId: certificate.id,
      title: certificate.title,
      realVideoDuration,
      totalVideoCount,
      metadata: certificate.metadata
    });
    
    // PRIORIDADE 1: Usar duração da tabela course_durations se disponível e completada
    if (durationMap && certificate.course_id) {
      const courseDuration = durationMap.get(certificate.course_id);
      if (courseDuration && courseDuration.syncStatus === 'completed' && courseDuration.calculatedHours !== '0 horas') {
        console.log('✅ [WORKLOAD] Usando duração da tabela course_durations (PRIORITÁRIA):', {
          courseId: certificate.course_id,
          duration: courseDuration.calculatedHours,
          syncStatus: courseDuration.syncStatus
        });
        return courseDuration.calculatedHours;
      }
    }
    
    // PRIORIDADE 2: Usar duração real sincronizada da API Panda Video (se > 0)
    if (realVideoDuration && realVideoDuration > 0) {
      console.log('🎯 [WORKLOAD] Usando duração real sincronizada da API:', realVideoDuration);
      const calculatedDuration = formatDurationForCertificate(realVideoDuration, totalVideoCount);
      console.log('📊 [WORKLOAD] Duração formatada da API:', calculatedDuration);
      return calculatedDuration;
    }
    
    // FALLBACK: Estimativa baseada no número de vídeos se não há dados reais
    let calculatedDuration = '';
    
    try {
      calculatedDuration = formatDurationForCertificate(0, totalVideoCount);
      console.log('⚠️ [WORKLOAD] Usando estimativa baseada em vídeos:', calculatedDuration);
      
    } catch (error) {
      console.error('❌ [WORKLOAD] Erro em formatDurationForCertificate:', error);
      
      // FALLBACK de emergência
      if (totalVideoCount > 0) {
        const estimatedMinutes = totalVideoCount * 6;
        const hours = Math.ceil(estimatedMinutes / 60);
        calculatedDuration = `${hours} hora${hours > 1 ? 's' : ''}`;
        console.warn('🚨 [WORKLOAD] Usando fallback de emergência:', calculatedDuration);
      } else {
        calculatedDuration = 'Duração não disponível';
        console.warn('⚠️ [WORKLOAD] Nenhum dado disponível para cálculo');
      }
    }
    
    console.log('✅ [WORKLOAD] Duração FINAL para certificado:', {
      calculatedDuration,
      courseId: certificate.course_id,
      title: certificate.title
    });
    return calculatedDuration;
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