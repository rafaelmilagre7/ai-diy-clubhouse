
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Certificate, CertificateTemplate } from "@/types/learningTypes";

export const useCertificates = (courseId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  
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
      const { data, error } = await supabase
        .rpc('check_certificate_eligibility', {
          user_id: user.id,
          course_id: courseId
        });
      
      if (error) throw error;
      
      return data || false;
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
      
      setIsGenerating(true);
      
      const { data, error } = await supabase
        .rpc('create_certificate_if_eligible', {
          user_id: user.id,
          course_id: courseId
        });
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: (certificateId) => {
      toast.success("Certificado gerado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['learning-certificates', user?.id] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao gerar certificado: ${error.message}`);
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });
  
  // Baixar certificado
  const downloadCertificate = async (certificateId: string) => {
    try {
      // Aqui você implementaria a lógica para baixar o PDF do certificado
      // Por enquanto, vamos apenas mostrar um toast de sucesso
      toast.success("Download do certificado iniciado!");
    } catch (error: any) {
      console.error("Erro ao baixar certificado:", error);
      toast.error(`Erro ao baixar certificado: ${error.message}`);
    }
  };
  
  return { 
    certificates, 
    isLoading, 
    error, 
    checkEligibility,
    generateCertificate: generateCertificate.mutate,
    isGenerating: isGenerating || generateCertificate.isPending,
    downloadCertificate
  };
};
