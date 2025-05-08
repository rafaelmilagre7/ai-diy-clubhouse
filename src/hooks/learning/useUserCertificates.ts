
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Certificate } from "@/types/learningTypes";

export function useUserCertificates(courseId?: string) {
  const { user } = useAuth();
  
  const { 
    data: certificates = [],
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['learning-certificates', user?.id, courseId],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        let query = supabase
          .from('learning_certificates')
          .select(`
            *,
            learning_courses: course_id (
              id,
              title,
              description,
              cover_image_url
            ),
            profiles: user_id (
              name,
              email
            )
          `);

        if (courseId) {
          query = query.eq('course_id', courseId);
        }
        
        const { data, error } = await query
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false });
          
        if (error) throw error;
        
        return data as Certificate[];
      } catch (error: any) {
        console.error("Erro ao buscar certificados:", error);
        throw error;
      }
    },
    enabled: !!user
  });

  // Função para baixar o certificado
  const downloadCertificate = async (certificateId: string) => {
    try {
      // Por enquanto, apenas simulamos o download com um toast
      // Em uma implementação completa, faria uma chamada para gerar o PDF
      toast.success("Download do certificado iniciado");
      toast("Esta funcionalidade será implementada em breve", {
        description: "O arquivo PDF será gerado e baixado automaticamente"
      });
    } catch (error) {
      console.error("Erro ao baixar certificado:", error);
      toast.error("Erro ao baixar o certificado");
    }
  };

  return {
    certificates,
    isLoading,
    error,
    downloadCertificate,
    refetch
  };
}
