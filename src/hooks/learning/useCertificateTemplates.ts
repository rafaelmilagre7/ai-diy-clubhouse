
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface CertificateTemplate {
  id: string;
  name: string;
  template_data: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useCertificateTemplates = () => {
  return useQuery({
    queryKey: ['certificate-templates'],
    queryFn: async (): Promise<CertificateTemplate[]> => {
      console.log('Simulando busca de templates de certificado...');
      
      // Return mock data since table doesn't exist
      return [
        {
          id: '1',
          name: 'Template Padrão',
          template_data: { layout: 'classic', colors: ['#00EAD9', '#ffffff'] },
          is_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    },
    staleTime: 10 * 60 * 1000
  });
};

export const useCreateCertificateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateData: Omit<CertificateTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Simulando criação de template:', templateData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: Date.now().toString(),
        ...templateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
      toast.success('Template criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar template:', error);
      toast.error('Erro ao criar template');
    }
  });
};

export const useUpdateCertificateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...templateData }: Partial<CertificateTemplate> & { id: string }) => {
      console.log('Simulando atualização de template:', id, templateData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id,
        ...templateData,
        updated_at: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
      toast.success('Template atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar template:', error);
      toast.error('Erro ao atualizar template');
    }
  });
};
