
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
      if (!user) return [];
      
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
        
        if (learningError) throw learningError;

        // Buscar certificados de soluções
        const { data: solutionCerts, error: solutionError } = await supabase
          .from('solution_certificates')
          .select(`
            *,
            solutions (title, description, thumbnail_url)
          `)
          .eq('user_id', user.id);
        
        if (solutionError) throw solutionError;

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
        
        return allCertificates;
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

// Função melhorada para gerar PDF do certificado
const generateCertificatePDF = async (certificate: any) => {
  try {
    // Template profissional de certificado
    const courseName = certificate.title || certificate.learning_courses?.title || certificate.solutions?.title || "Curso";
    const studentName = "Rafael Milagre"; // Você pode buscar do perfil do usuário se necessário
    const issueDate = new Date(certificate.issued_at).toLocaleDateString('pt-BR');
    const validationCode = certificate.validation_code;
    const certificateType = certificate.type === 'solution' ? 'solução' : 'curso';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px;
            min-height: 100vh;
          }
          
          .certificate { 
            max-width: 1123px;
            height: 794px;
            margin: 0 auto; 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            position: relative;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          }
          
          .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 80%, rgba(120, 53, 235, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
          }
          
          .border-frame {
            position: absolute;
            inset: 20px;
            border: 3px solid transparent;
            background: linear-gradient(45deg, #7c3aed, #2563eb, #7c3aed) border-box;
            -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: subtract;
            mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
            mask-composite: subtract;
          }
          
          .inner-border {
            position: absolute;
            inset: 30px;
            border: 1px solid rgba(120, 53, 235, 0.2);
          }
          
          .content {
            position: relative;
            z-index: 10;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 60px;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #7c3aed, #2563eb);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(120, 53, 235, 0.3);
          }
          
          .logo::after {
            content: '🏆';
            font-size: 36px;
          }
          
          .title {
            font-size: 48px;
            font-weight: 700;
            background: linear-gradient(135deg, #1e293b, #475569);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
          }
          
          .subtitle {
            width: 120px;
            height: 3px;
            background: linear-gradient(90deg, #7c3aed, #2563eb);
            margin: 0 auto 40px;
            border-radius: 2px;
          }
          
          .certifies {
            font-size: 20px;
            color: #64748b;
            margin-bottom: 20px;
            font-weight: 400;
          }
          
          .student-name {
            font-size: 42px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 30px;
            position: relative;
            padding-bottom: 15px;
          }
          
          .student-name::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #7c3aed, transparent);
          }
          
          .completion-text {
            font-size: 20px;
            color: #64748b;
            margin-bottom: 15px;
            font-weight: 400;
          }
          
          .course-name {
            font-size: 32px;
            font-weight: 600;
            background: linear-gradient(135deg, #7c3aed, #2563eb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 50px;
            line-height: 1.2;
            max-width: 600px;
          }
          
          .details {
            display: flex;
            justify-content: center;
            gap: 80px;
            margin-top: 40px;
          }
          
          .detail-item {
            text-align: center;
          }
          
          .detail-label {
            font-size: 14px;
            color: #94a3b8;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          
          .detail-value {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
          }
          
          .validation-code {
            font-family: 'Courier New', monospace;
            color: #7c3aed;
            font-weight: bold;
          }
          
          .footer {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
          }
          
          .signature-line {
            width: 200px;
            height: 1px;
            background: #cbd5e1;
            margin: 0 auto 8px;
          }
          
          .authority {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
          }
          
          .organization {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 20px;
          }
          
          .verification {
            font-size: 11px;
            color: #94a3b8;
            max-width: 400px;
            line-height: 1.4;
          }
          
          .decorative-elements {
            position: absolute;
            top: 40px;
            left: 40px;
            width: 40px;
            height: 40px;
            opacity: 0.1;
          }
          
          .decorative-elements:nth-child(2) {
            top: 40px;
            right: 40px;
            left: auto;
          }
          
          .decorative-elements:nth-child(3) {
            bottom: 40px;
            left: 40px;
            top: auto;
            width: 30px;
            height: 30px;
          }
          
          .decorative-elements:nth-child(4) {
            bottom: 40px;
            right: 40px;
            left: auto;
            top: auto;
            width: 30px;
            height: 30px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="border-frame"></div>
          <div class="inner-border"></div>
          
          <div class="decorative-elements">✨</div>
          <div class="decorative-elements">✨</div>
          <div class="decorative-elements">⭐</div>
          <div class="decorative-elements">⭐</div>
          
          <div class="content">
            <div class="logo"></div>
            
            <h1 class="title">CERTIFICADO</h1>
            <div class="subtitle"></div>
            
            <p class="certifies">Certificamos que</p>
            
            <h2 class="student-name">${studentName}</h2>
            
            <p class="completion-text">concluiu com êxito ${certificateType === 'solução' ? 'a' : 'o'} ${certificateType}</p>
            
            <h3 class="course-name">${courseName}</h3>
            
            <div class="details">
              <div class="detail-item">
                <div class="detail-label">Data de Emissão</div>
                <div class="detail-value">${issueDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Código de Validação</div>
                <div class="detail-value validation-code">${validationCode}</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="signature-line"></div>
            <div class="authority">Viver de IA</div>
            <div class="organization">Formação em Inteligência Artificial</div>
            <div class="verification">
              Verifique a autenticidade deste certificado em:<br>
              viverdeia.ai/validar/${validationCode}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Criar elemento temporário para renderizar
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    document.body.appendChild(tempDiv);

    // Aguardar fontes carregarem
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Usar html2canvas e jsPDF para gerar PDF
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;
    
    const canvas = await html2canvas(tempDiv.querySelector('.certificate') as HTMLElement, { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: 1123,
      height: 794
    });
    
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'px', 
      format: [1123, 794]
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
    
    const filename = `certificado-${courseName.replace(/[^a-zA-Z0-9]/g, '-')}-${validationCode}.pdf`;
    pdf.save(filename);
    
    document.body.removeChild(tempDiv);
    toast.success('Certificado baixado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error('Erro ao gerar PDF do certificado');
  }
};
