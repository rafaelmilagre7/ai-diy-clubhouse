
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useCertificateTemplate = () => {
  return useQuery({
    queryKey: ['certificate-template'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_certificate_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao buscar template:', error);
        throw error;
      }

      return data;
    },
  });
};
