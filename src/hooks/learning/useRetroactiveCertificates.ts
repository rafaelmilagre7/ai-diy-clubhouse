
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useRetroactiveCertificates = () => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // Gerar certificados retroativos para todos os usuários (apenas admin)
  const generateAllRetroactiveCertificates = useMutation({
    mutationFn: async () => {
      if (!isAdmin) {
        throw new Error("Apenas administradores podem executar esta ação");
      }

      const { data, error } = await supabase.rpc('generate_retroactive_certificates');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const total = data.total_created || 0;
      const solutionCerts = data.solution_certificates_created || 0;
      const learningCerts = data.learning_certificates_created || 0;
      
      if (total > 0) {
        toast.success(
          `Certificados retroativos gerados com sucesso!\n` +
          `Soluções: ${solutionCerts}\n` +
          `Cursos: ${learningCerts}\n` +
          `Total: ${total}`
        );
      } else {
        toast.info("Nenhum certificado retroativo foi necessário gerar.");
      }
    },
    onError: (error: any) => {
      console.error("Erro ao gerar certificados retroativos:", error);
      toast.error("Erro ao gerar certificados retroativos. Tente novamente.");
    }
  });

  // Gerar certificado individual para o usuário atual
  const generateUserRetroactiveCertificates = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      let totalGenerated = 0;
      const errors: string[] = [];

      // Tentar gerar certificados de soluções
      const { data: progressData } = await supabase
        .from('progress')
        .select('solution_id')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      if (progressData) {
        for (const progress of progressData) {
          try {
            const { data, error } = await supabase.rpc('create_solution_certificate_if_eligible', {
              p_user_id: user.id,
              p_solution_id: progress.solution_id
            });
            
            if (!error && data) {
              totalGenerated++;
            }
          } catch (err: any) {
            if (!err.message.includes('já possui certificado')) {
              errors.push(`Solução: ${err.message}`);
            }
          }
        }
      }

      // Tentar gerar certificados de cursos
      const { data: coursesData } = await supabase
        .from('learning_courses')
        .select('id');

      if (coursesData) {
        for (const course of coursesData) {
          try {
            const { data, error } = await supabase.rpc('create_learning_certificate_if_eligible', {
              p_user_id: user.id,
              p_course_id: course.id
            });
            
            if (!error && data) {
              totalGenerated++;
            }
          } catch (err: any) {
            if (!err.message.includes('já possui certificado')) {
              errors.push(`Curso: ${err.message}`);
            }
          }
        }
      }

      return { totalGenerated, errors };
    },
    onSuccess: (result) => {
      const { totalGenerated, errors } = result;
      
      if (totalGenerated > 0) {
        toast.success(`${totalGenerated} certificado(s) gerado(s) com sucesso!`);
      } else {
        toast.info("Nenhum certificado novo foi gerado. Você já possui todos os certificados disponíveis ou não completou os requisitos necessários.");
      }
      
      if (errors.length > 0) {
        console.warn("Erros durante a geração:", errors);
      }
    },
    onError: (error: any) => {
      console.error("Erro ao gerar certificados:", error);
      toast.error("Erro ao gerar certificados. Tente novamente.");
    }
  });

  return {
    generateAllRetroactiveCertificates: generateAllRetroactiveCertificates.mutate,
    isGeneratingAll: generateAllRetroactiveCertificates.isPending,
    generateUserRetroactiveCertificates: generateUserRetroactiveCertificates.mutate,
    isGeneratingUser: generateUserRetroactiveCertificates.isPending,
    isAdmin
  };
};
