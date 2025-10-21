import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const OpportunitiesManagementTable = () => {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['admin-networking-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles_networking_safe')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
    },
    {
      key: 'company_name',
      label: 'Empresa',
      sortable: true,
    },
    {
      key: 'industry',
      label: 'Setor',
      render: (item: any) => (
        <Badge variant="secondary">{item.industry || 'N/A'}</Badge>
      ),
    },
    {
      key: 'role',
      label: 'Função',
      render: (item: any) => (
        <Badge variant="outline">{item.role}</Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Criado em',
      sortable: true,
      render: (item: any) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(item.created_at), "dd/MM/yyyy", { locale: ptBR })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (item: any) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" title="Visualizar">
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Editar">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Excluir">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminTable
      data={opportunities || []}
      columns={columns}
      loading={isLoading}
      emptyState={<p className="text-muted-foreground">Nenhuma oportunidade encontrada</p>}
    />
  );
};
