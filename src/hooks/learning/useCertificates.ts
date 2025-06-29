
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Certificate } from "@/types/learningTypes";

export const useCertificates = (courseId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Buscar certificados do usuário
  const { 
    data: certificates = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['learning-certificates', user?.id, courseId],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        let query = supabase
          .from('learning_certificates')
          .select(`
            *,
            learning_courses:course_id (title, description, cover_image_url)
          `);
          
        if (courseId) {
          query = query.eq('course_id', courseId);
        }
        
        const { data, error } = await query.eq('user_id', user.id);
        
        if (error) throw error;
        
        return data as Certificate[];
      } catch (error) {
        console.error("Erro ao buscar certificados:", error);
        return [];
      }
    },
    enabled: !!user
  });
  
  // Verificar elegibilidade para certificado
  const checkEligibility = async (courseId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para verificar elegibilidade");
      return false;
    }
    
    try {
      // Verificar se o usuário completou o curso
      const { data: progress, error } = await supabase
        .from('learning_progress')
        .select(`
          lesson_id,
          progress_percentage,
          completed_at,
          learning_lessons!inner (
            id,
            learning_modules!inner (
              id,
              course_id
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('learning_lessons.learning_modules.course_id', courseId);
      
      if (error) throw error;
      
      // Verificar se todas as aulas foram completadas (100%)
      const allCompleted = progress && progress.length > 0 && 
        progress.every(p => p.progress_percentage === 100 && p.completed_at);
      
      return allCompleted;
    } catch (error: any) {
      console.error("Erro ao verificar elegibilidade:", error);
      toast.error(`Erro ao verificar elegibilidade: ${error.message}`);
      return false;
    }
  };
  
  // Gerar certificado
  const generateCertificate = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Verificar elegibilidade novamente antes de gerar
      const eligible = await checkEligibility(courseId);
      if (!eligible) {
        throw new Error("Usuário não elegível para certificado");
      }
      
      // Gerar código de validação
      const validationCode = await supabase.rpc('generate_certificate_validation_code');
      
      // Criar certificado
      const { data, error } = await supabase
        .from('learning_certificates')
        .insert({
          user_id: user.id,
          course_id: courseId,
          validation_code: validationCode.data,
          issued_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      toast.success("Certificado gerado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['learning-certificates', user?.id] });
    },
    onError: (error: any) => {
      console.error("Erro ao gerar certificado:", error);
      if (error.message.includes('não elegível')) {
        toast.error('Você precisa completar todas as aulas do curso para gerar o certificado.');
      } else {
        toast.error(`Erro ao gerar certificado: ${error.message}`);
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

// Função auxiliar para gerar PDF do certificado
const generateCertificatePDF = async (certificate: any) => {
  try {
    // Template básico de certificado
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
          .certificate { max-width: 800px; margin: 0 auto; border: 10px solid #8a2be2; padding: 20px; }
          h1 { font-size: 36px; color: #8a2be2; margin-bottom: 20px; }
          .student-name { font-size: 28px; font-weight: bold; margin: 20px 0; }
          .course-name { font-size: 22px; margin: 10px 0 30px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>CERTIFICADO DE CONCLUSÃO</h1>
          <p>Este certifica que</p>
          <p class="student-name">${certificate.profiles?.name || 'Usuário'}</p>
          <p>concluiu com sucesso o curso</p>
          <p class="course-name">${certificate.learning_courses?.title || 'Curso'}</p>
          <p>Emitido em: ${new Date(certificate.issued_at).toLocaleDateString('pt-BR')}</p>
          <p>Código: ${certificate.validation_code}</p>
        </div>
      </body>
      </html>
    `;

    // Criar elemento temporário para renderizar
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    // Usar html2canvas e jsPDF para gerar PDF
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;
    
    const canvas = await html2canvas(tempDiv, { scale: 2 });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`certificado-${certificate.learning_courses?.title || 'curso'}-${certificate.validation_code}.pdf`);
    
    document.body.removeChild(tempDiv);
    toast.success('Certificado baixado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error('Erro ao gerar PDF do certificado');
  }
};
