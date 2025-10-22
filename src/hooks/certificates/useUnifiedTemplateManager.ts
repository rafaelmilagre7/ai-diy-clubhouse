import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { templateEngine } from '@/utils/certificates/templateEngine';
import { toast } from 'sonner';

export interface UnifiedTemplate {
  id: string;
  name: string;
  description?: string;
  html_template: string;
  css_styles: string;
  is_active: boolean;
  is_default: boolean;
  type: 'course' | 'solution' | 'default';
  course_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Hook unificado para gerenciar templates de certificados
 * Funciona tanto para cursos quanto para soluções
 */
export const useUnifiedTemplateManager = (courseId?: string) => {
  const queryClient = useQueryClient();

  // Buscar templates disponíveis
  const { 
    data: templates = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['unified-certificate-templates', courseId],
    queryFn: async (): Promise<UnifiedTemplate[]> => {
      const allTemplates: UnifiedTemplate[] = [];

      try {
        // 1. Buscar templates de cursos se courseId for fornecido
        if (courseId) {
          const { data: courseTemplates, error: courseError } = await supabase
            .from('learning_certificate_templates')
            .select('*')
            .eq('course_id', courseId)
            .eq('is_active', true)
            .order('is_default', { ascending: false });

          if (courseError) throw courseError;

          allTemplates.push(...(courseTemplates || []).map(template => ({
            ...template,
            type: 'course' as const
          })));
        }

        // 2. Buscar templates gerais de cursos (sem course_id específico)
        const { data: generalCourseTemplates, error: generalError } = await supabase
          .from('learning_certificate_templates')
          .select('*')
          .is('course_id', null)
          .eq('is_active', true)
          .order('is_default', { ascending: false });

        if (generalError) throw generalError;

        allTemplates.push(...(generalCourseTemplates || []).map(template => ({
          ...template,
          type: 'course' as const
        })));

        // 3. Buscar templates de soluções
        const { data: solutionTemplates, error: solutionError } = await supabase
          .from('solution_certificate_templates')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (solutionError) throw solutionError;

        allTemplates.push(...(solutionTemplates || []).map(template => ({
          ...template,
          type: 'solution' as const
        })));

        // 4. Adicionar template padrão do engine se não houver outros
        if (allTemplates.length === 0) {
          const defaultTemplate = templateEngine.generateDefaultTemplate();
          allTemplates.push({
            id: 'default-engine-template',
            name: defaultTemplate.name || 'Template Padrão',
            description: 'Template padrão gerado pelo sistema',
            html_template: defaultTemplate.html_template,
            css_styles: defaultTemplate.css_styles,
            is_active: true,
            is_default: true,
            type: 'default' as const,
            metadata: defaultTemplate.metadata,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        return allTemplates;

      } catch (error) {
        console.error('❌ Erro ao carregar templates unificados:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  // Obter template específico por tipo
  const getTemplateByType = (type: 'course' | 'solution'): UnifiedTemplate | null => {
    const typeTemplates = templates.filter(t => t.type === type || t.type === 'default');
    return typeTemplates.find(t => t.is_default) || typeTemplates[0] || null;
  };

  // Obter template por ID
  const getTemplateById = (templateId: string): UnifiedTemplate | null => {
    return templates.find(t => t.id === templateId) || null;
  };

  // Mutação para salvar template (apenas para admins)
  const saveTemplate = useMutation({
    mutationFn: async (templateData: Partial<UnifiedTemplate>) => {
      if (templateData.type === 'course') {
        const { data, error } = await supabase
          .from('learning_certificate_templates')
          .upsert({
            id: templateData.id,
            name: templateData.name,
            description: templateData.description,
            html_template: templateData.html_template,
            css_styles: templateData.css_styles,
            is_active: templateData.is_active ?? true,
            is_default: templateData.is_default ?? false,
            course_id: templateData.course_id,
            metadata: templateData.metadata || {}
          })
          .select();
        
        if (error) throw error;
        return data[0];
      } else {
        const { data, error } = await supabase
          .from('solution_certificate_templates')
          .upsert({
            id: templateData.id,
            name: templateData.name,
            description: templateData.description,
            html_template: templateData.html_template,
            css_styles: templateData.css_styles,
            is_active: templateData.is_active ?? true,
            metadata: templateData.metadata || {}
          })
          .select();
        
        if (error) throw error;
        return data[0];
      }
    },
    onSuccess: () => {
      toast.success('Template salvo com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['unified-certificate-templates'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar template: ${error.message}`);
    }
  });

  return {
    templates,
    isLoading,
    error,
    getTemplateByType,
    getTemplateById,
    saveTemplate: saveTemplate.mutate,
    isSaving: saveTemplate.isPending
  };
};