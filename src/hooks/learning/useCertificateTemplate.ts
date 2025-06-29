
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useCertificateTemplate = (forceRefresh = false) => {
  const queryClient = useQueryClient();

  // Função para limpar cache se necessário
  const clearCache = () => {
    queryClient.invalidateQueries({ queryKey: ['certificate-template'] });
  };

  const query = useQuery({
    queryKey: ['certificate-template'],
    queryFn: async () => {
      console.log('🔄 Buscando template de certificado...');
      
      const { data, error } = await supabase
        .from('solution_certificate_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar template:', error);
        throw error;
      }

      console.log('✅ Template carregado:', {
        id: data.id,
        name: data.name,
        htmlLength: data.html_template?.length || 0,
        cssLength: data.css_styles?.length || 0,
        isActive: data.is_active
      });

      return data;
    },
    staleTime: forceRefresh ? 0 : 5 * 60 * 1000, // 5 minutos normal, 0 se forçar refresh
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    clearCache
  };
};
