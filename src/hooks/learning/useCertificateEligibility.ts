
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export function useCertificateEligibility(courseId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Verificar se o usuário é elegível para receber um certificado
  const { 
    data: isEligible = false,
    isLoading: isCheckingEligibility,
    refetch: recheckEligibility
  } = useQuery({
    queryKey: ['certificate-eligibility', courseId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      try {
        // Primeiro verificamos se o usuário já tem o certificado
        const { data: existingCertificates, error: certError } = await supabase
          .from('learning_certificates')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (certError) throw certError;
        
        // Se já tem certificado, retorna true (elegível)
        if (existingCertificates) return true;
        
        // Caso contrário, verifica o progresso total do curso
        const { data: modules, error: modulesError } = await supabase
          .from('learning_modules')
          .select('id')
          .eq('course_id', courseId)
          .eq('published', true);
          
        if (modulesError) throw modulesError;
        
        if (!modules || modules.length === 0) return false;
        
        // Buscar todas as aulas dos módulos do curso
        const moduleIds = modules.map(m => m.id);
        
        const { data: lessons, error: lessonsError } = await supabase
          .from('learning_lessons')
          .select('id')
          .in('module_id', moduleIds)
          .eq('published', true);
          
        if (lessonsError) throw lessonsError;
        
        if (!lessons || lessons.length === 0) return false;
        
        // Verificar se todas as aulas foram concluídas
        const lessonIds = lessons.map(l => l.id);
        
        const { data: progress, error: progressError } = await supabase
          .from('learning_progress')
          .select('lesson_id, progress_percentage')
          .in('lesson_id', lessonIds)
          .eq('user_id', user.id);
          
        if (progressError) throw progressError;
        
        if (!progress) return false;
        
        // Mapear progresso por aula
        const lessonProgress: Record<string, number> = {};
        progress.forEach(p => {
          lessonProgress[p.lesson_id] = p.progress_percentage;
        });
        
        // Verificar se todas as aulas têm pelo menos 95% de progresso
        const allLessonsCompleted = lessonIds.every(
          lessonId => (lessonProgress[lessonId] || 0) >= 95
        );
        
        return allLessonsCompleted;
      } catch (error) {
        console.error("Erro ao verificar elegibilidade para certificado:", error);
        return false;
      }
    },
    enabled: !!user && !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  // Gerar certificado para o usuário
  const generateCertificate = useMutation({
    mutationFn: async () => {
      if (!user || !courseId) throw new Error("Usuário ou curso não definido");
      
      setIsGenerating(true);
      
      try {
        // Verificar se já possui o certificado
        const { data: existingCert, error: certError } = await supabase
          .from('learning_certificates')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();
          
        if (certError) throw certError;
        
        if (existingCert) {
          return existingCert.id;
        }
        
        // Gerar código de validação único
        const validationCode = generateValidationCode();
        
        // Criar certificado
        const { data, error } = await supabase
          .from('learning_certificates')
          .insert({
            user_id: user.id,
            course_id: courseId,
            issued_at: new Date().toISOString(),
            validation_code: validationCode,
            has_validation_page: true,
            metadata: {}
          })
          .select('id')
          .single();
          
        if (error) throw error;
        
        return data.id;
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: () => {
      toast.success("Certificado gerado com sucesso!");
      recheckEligibility();
      queryClient.invalidateQueries({ queryKey: ['learning-certificates', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['learning-certificates', user?.id, courseId] });
    },
    onError: (error: any) => {
      toast.error("Erro ao gerar certificado", {
        description: error.message
      });
    }
  });

  // Função auxiliar para gerar código de validação
  function generateValidationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 4;
    let code = '';
    
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segmentLength; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < segments - 1) code += '-';
    }
    
    return code;
  }

  return {
    isEligible,
    isCheckingEligibility,
    generateCertificate: generateCertificate.mutate,
    isGenerating: isGenerating || generateCertificate.isPending
  };
}
