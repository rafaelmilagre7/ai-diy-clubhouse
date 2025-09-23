import { useState } from 'react';
import { csvExporter } from '@/utils/csvExporter';
import { UserProfile, getUserRoleName } from '@/lib/supabase';
import { toast } from 'sonner';

export function useUserExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportUsers = async (users: UserProfile[], searchQuery?: string) => {
    if (!users || users.length === 0) {
      toast.error('Nenhum usuário para exportar');
      return;
    }

    setIsExporting(true);

    try {
      // Preparar dados para exportação
      const exportData = users.map(user => ({
        id: user.id,
        nome: user.name || 'Não informado',
        email: user.email,
        empresa: user.company_name || 'Não informado',
        setor: user.industry || 'Não informado',
        papel: getUserRoleName(user) || 'membro',
        onboarding_completo: user.onboarding_completed ? 'Sim' : 'Não',
        status: 'Ativo', // Assumindo ativo por padrão
        data_criacao: new Date(user.created_at).toLocaleDateString('pt-BR'),
        avatar_url: user.avatar_url || ''
      }));

      // Definir cabeçalhos em português
      const headers = {
        id: 'ID',
        nome: 'Nome',
        email: 'E-mail',
        empresa: 'Empresa',
        setor: 'Setor/Indústria',
        papel: 'Papel/Role',
        onboarding_completo: 'Onboarding Completo',
        status: 'Status',
        data_criacao: 'Data de Criação',
        avatar_url: 'URL do Avatar'
      };

      // Criar nome do arquivo com timestamp e filtros
      const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
      const filterText = searchQuery ? `_filtro_${searchQuery.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
      const fileName = `usuarios_${timestamp}${filterText}.csv`;

      // Exportar usando o csvExporter
      csvExporter.exportToCSV(
        exportData,
        headers,
        fileName,
        {
          delimiter: ',',
          includeHeaders: true,
          dateFormat: 'BR'
        }
      );

      toast.success('Dados exportados com sucesso!', {
        description: `${exportData.length} usuários exportados para ${fileName}`
      });

    } catch (error) {
      console.error('Erro na exportação:', error);
      toast.error('Erro ao exportar dados', {
        description: 'Não foi possível gerar o arquivo CSV. Tente novamente.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportUsers,
    isExporting
  };
}