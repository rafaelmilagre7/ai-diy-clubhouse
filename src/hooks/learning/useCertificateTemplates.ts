
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { CertificateTemplate } from "@/types/learningTypes";

export const useCertificateTemplates = (courseId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Buscar templates de certificados
  const { 
    data: templates = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['certificate-templates', courseId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('learning_certificate_templates')
          .select(`*`);
          
        if (courseId) {
          query = query.eq('course_id', courseId).order('is_default', { ascending: false });
        } else {
          query = query.order('is_default', { ascending: false });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data as CertificateTemplate[];
      } catch (error) {
        console.error("Erro ao buscar templates de certificados:", error);
        return [];
      }
    }
  });
  
  // Salvar template de certificado
  const saveTemplate = useMutation({
    mutationFn: async (templateData: Partial<CertificateTemplate>) => {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const isUpdate = !!templateData.id;
      
      if (isUpdate) {
        const { data, error } = await supabase
          .from('learning_certificate_templates')
          .update({
            name: templateData.name,
            description: templateData.description,
            html_template: templateData.html_template,
            is_default: templateData.is_default || false,
            course_id: templateData.course_id,
            metadata: templateData.metadata || {},
            updated_at: new Date().toISOString()
          })
          .eq('id', templateData.id)
          .select();
          
        if (error) throw error;
        
        return data?.[0] as CertificateTemplate;
      } else {
        const { data, error } = await supabase
          .from('learning_certificate_templates')
          .insert({
            name: templateData.name,
            description: templateData.description,
            html_template: templateData.html_template,
            is_default: templateData.is_default || false,
            course_id: templateData.course_id,
            created_by: user.id,
            metadata: templateData.metadata || {}
          })
          .select();
          
        if (error) throw error;
        
        return data?.[0] as CertificateTemplate;
      }
    },
    onSuccess: (data, variables) => {
      toast.success(variables.id ? "Template atualizado com sucesso!" : "Template criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar template: ${error.message}`);
    }
  });
  
  // Excluir template de certificado
  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('learning_certificate_templates')
        .delete()
        .eq('id', templateId);
        
      if (error) throw error;
      
      return templateId;
    },
    onSuccess: () => {
      toast.success("Template excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir template: ${error.message}`);
    }
  });
  
  return { 
    templates, 
    isLoading, 
    error, 
    saveTemplate: saveTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    isSaving: saveTemplate.isPending,
    isDeleting: deleteTemplate.isPending
  };
};
